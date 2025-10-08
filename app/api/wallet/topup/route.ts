import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REG_FEE = 2500;

export async function POST(req: NextRequest) {
  try {
    const headers = req.headers.get("cookie");
    const token = headers
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const { amount } = await req.json();

    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get user and account details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const account = user.accounts[0];
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if registration fee needs to be deducted
    if (!user.registrationPaid && parsed < REG_FEE) {
      return NextResponse.json(
        {
          error: `Minimum ₦${REG_FEE.toLocaleString()} required on first top-up to cover registration fee.`,
        },
        { status: 400 }
      );
    }

    // Generate unique reference for this transaction
    const uuid = uuidv4();
    const reference = `TOPUP-${uuid.slice(0, 16)}`;

    // Create pending transaction record
    await prisma.transaction.create({
      data: {
        reference,
        amount: parsed,
        type: "topup",
        status: "pending",
        paymentMethod: "paystack",
        description: user.registrationPaid
          ? `Wallet top-up of ₦${parsed.toLocaleString()}`
          : `Wallet top-up of ₦${parsed.toLocaleString()} (includes ₦${REG_FEE.toLocaleString()} registration fee)`,
        accountId: account.id,
      },
    });

    // Check for environment variable
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service is not properly configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    // Initialize Paystack transaction
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: `${user.fullname.split(" ")[0]}-${user.phone}@mightyshare.com`,
        amount: parsed * 100, // Convert to kobo
        currency: "NGN",
        reference: reference,
        callback_url: `${baseUrl}/api/wallet/callback`,
        metadata: {
          userId: user.id,
          accountId: account.id,
          fullname: user.fullname,
          phone: user.phone,
          transactionType: "wallet_topup",
          registrationPaid: user.registrationPaid,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = paystackRes.data;

    if (paystackData.status && paystackData.data.authorization_url) {
      return NextResponse.json({
        success: true,
        paymentUrl: paystackData.data.authorization_url,
        reference: reference,
        amount: parsed,
      });
    } else {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { reference },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Top-up initialization error:", err);

    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status || 500;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment initialization failed";

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json(
      { error: "Top-up initialization failed" },
      { status: 500 }
    );
  }
}
