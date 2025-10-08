// /app/api/paystack/verify/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify the transaction with Paystack
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = res.data;

    if (!data.status || !data.data) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const transaction = data.data;

    // Check if payment was successful
    if (transaction.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful", status: transaction.status },
        { status: 400 }
      );
    }

    // Get user from token
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

    // Update payment record in database
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: reference,
        userId: decoded.userId,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESSFUL",
        customerMetadata: JSON.stringify({
          ...JSON.parse(payment.customerMetadata || "{}"),
          verifiedAt: new Date().toISOString(),
          paystackResponse: transaction,
        }),
      },
    });

    // Mark user registration as paid
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { registrationPaid: true },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      amount: transaction.amount / 100, // Convert from kobo to naira
      reference: transaction.reference,
      userId: payment.userId,
    });
  } catch (err: any) {
    console.error("❌ Paystack verify error:", err);

    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status || 500;
      const errorMessage =
        err.response?.data?.message || err.message || "Verification failed";

      return NextResponse.json(
        { error: errorMessage, details: err.response?.data },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Payment verification error", details: err.message },
      { status: 500 }
    );
  }
}
