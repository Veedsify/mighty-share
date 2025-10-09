// /app/api/alatpay/topup/route.ts
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import PlanConfig from "@/config/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
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

    // Get registration fee based on user's plan
    const userPlan = user.plan as keyof typeof PlanConfig;
    const REG_FEE = PlanConfig[userPlan]?.amount || PlanConfig.A.amount;

    // Check if registration fee needs to be deducted
    if (!user.registrationPaid && parsed < REG_FEE) {
      return NextResponse.json(
        {
          error: `Minimum ₦${REG_FEE.toLocaleString()} required on first top-up to cover registration fee for Plan ${userPlan}.`,
        },
        { status: 400 }
      );
    }

    // Generate unique reference for this transaction
    const uuid = uuidv4();
    const orderId = `TOPUP-${uuid.slice(0, 10)}`;
    const reference = orderId;

    // Create pending transaction record
    await prisma.transaction.create({
      data: {
        reference,
        amount: parsed,
        type: "topup",
        status: "pending",
        paymentMethod: "alatpay",
        description: user.registrationPaid
          ? `Wallet top-up of ₦${parsed.toLocaleString()}`
          : `Wallet top-up of ₦${parsed.toLocaleString()} (includes ₦${REG_FEE.toLocaleString()} registration fee for Plan ${userPlan})`,
        accountId: account.id,
      },
    });

    // Check for environment variable
    if (!process.env.NEXT_PUBLIC_ALATPAY_SECRET_KEY) {
      console.error("ALATPAY_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service is not properly configured" },
        { status: 500 }
      );
    }

    // Initialize ALATPay transaction
    const res = await axios.post(
      "https://apibox.alatpay.ng/bank-transfer/api/v1/bankTransfer/virtualAccount",
      {
        businessId: "27a4ed9c-e6db-490e-1495-08ddfceabbff",
        amount: parsed,
        currency: "NGN",
        orderId: orderId,
        description: user.registrationPaid
          ? `Wallet top-up of ₦${parsed.toLocaleString()}`
          : `Wallet top-up of ₦${parsed.toLocaleString()} (includes ₦${REG_FEE.toLocaleString()} registration fee)`,
        customer: {
          email: `${user.fullname.split(" ")[0]}-${user.phone}@mightyshare.com`,
          phone: user.phone,
          firstName: user.fullname.split(" ")[0] || user.fullname,
          lastName: user.fullname.split(" ")[1] || user.fullname,
          metadata: JSON.stringify({
            OtherName: user.fullname,
            userId: user.id,
            accountId: account.id,
            transactionType: "wallet_topup",
            registrationPaid: user.registrationPaid,
            userPlan: user.plan,
            registrationFee: REG_FEE,
          }),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key":
            process.env.NEXT_PUBLIC_ALATPAY_SECRET_KEY,
        },
      }
    );

    const data = res.data;

    if (res.status === 200 && data.status) {
      return NextResponse.json({
        success: true,
        ...data,
      });
    } else {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { reference },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("❌ ALATPay top-up initialization error:", err);

    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status || 500;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment initialization failed";

      return NextResponse.json(
        { error: errorMessage, details: err.response?.data },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Top-up initialization failed" },
      { status: 500 }
    );
  }
}
