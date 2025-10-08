// /app/api/alatpay/verify/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference && !orderId) {
      return NextResponse.json(
        { error: "Payment reference or orderId is required" },
        { status: 400 }
      );
    }

    const paymentRef = reference || orderId;

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

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: paymentRef,
        userId: decoded.userId,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Verify with AlatPay
    try {
      const verifyUrl = `${process.env.ALATPAY_BASE_URL}/alatpaytransaction/api/v1/transactions/${paymentRef}`;

      const res = await axios.get(verifyUrl, {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key":
            process.env.NEXT_PUBLIC_ALATPAY_SECRET_KEY,
        },
      });

      const data = res.data;

      if (data.status === "success" && data.data) {
        const transaction = data.data;

        // Check if payment was successful
        if (
          transaction.status === "Successful" ||
          transaction.status === "SUCCESSFUL"
        ) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "SUCCESSFUL",
              customerMetadata: JSON.stringify({
                ...JSON.parse(payment.customerMetadata || "{}"),
                verifiedAt: new Date().toISOString(),
                alatpayResponse: transaction,
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
            amount: transaction.amount || payment.amount,
            reference: paymentRef,
            userId: payment.userId,
          });
        } else {
          return NextResponse.json(
            { error: "Payment was not successful", status: transaction.status },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: data.message || "Payment verification failed" },
          { status: 400 }
        );
      }
    } catch (verifyError: any) {
      console.error(
        "❌ AlatPay verify API error:",
        verifyError.response?.data || verifyError.message
      );

      // If verification fails, return error but don't fail completely
      return NextResponse.json(
        {
          error: "Could not verify payment with AlatPay",
          details: verifyError.message,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("❌ AlatPay verify error:", err);

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
