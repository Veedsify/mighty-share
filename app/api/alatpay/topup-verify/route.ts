// /app/api/alatpay/topup-verify/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import PlanConfig from "@/config/plan";

export async function POST(req: Request) {
  try {
    let { transactionId, orderId } = await req.json();
    if (!transactionId && !orderId) {
      return NextResponse.json(
        { error: "Payment transactionId or orderId is required" },
        { status: 400 }
      );
    }

    const paymentRef = orderId;

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

    // Find transaction record
    const dbTransaction = await prisma.transaction.findFirst({
      where: {
        reference: paymentRef,
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!dbTransaction) {
      return NextResponse.json(
        { error: "Transaction record not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (dbTransaction.status === "successful") {
      return NextResponse.json({
        success: true,
        message: "Transaction already verified",
        amount: dbTransaction.amount,
        reference: paymentRef,
        userId: decoded.userId,
        alreadyProcessed: true,
      });
    }

    const user = dbTransaction.account.user;
    const account = dbTransaction.account;

    // Verify with AlatPay
    try {
      const verifyUrl = `https://apibox.alatpay.ng/bank-transfer/api/v1/bankTransfer/transactions/${transactionId}`;

      const res = await axios.get(verifyUrl, {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key":
            process.env.NEXT_PUBLIC_ALATPAY_SECRET_KEY,
        },
      });

      const response = res.data;

      if (
        response.status &&
        response.data.status === "completed" &&
        response.data.amount >= dbTransaction.amount
      ) {
        const transaction = response.data;

        // Get registration fee based on user's plan
        const userPlan = user.plan as keyof typeof PlanConfig;
        const REG_FEE = PlanConfig[userPlan]?.amount || PlanConfig.A.amount;

        // Calculate credit amount (deduct registration fee if needed)
        let credit = dbTransaction.amount;
        let regDeducted = false;

        if (!user.registrationPaid) {
          credit = dbTransaction.amount - REG_FEE;
          regDeducted = true;
        }

        // Update account balance, transaction status, and user registration in a transaction
        await prisma.$transaction([
          // Update account balance
          prisma.account.update({
            where: { id: account.id },
            data: {
              balance: account.balance + credit,
            },
          }),

          // Update transaction status
          prisma.transaction.update({
            where: { id: dbTransaction.id },
            data: {
              status: "successful",
              platformTransactionReference: transaction.transactionId,
            },
          }),

          // Mark registration as paid if applicable
          ...(regDeducted
            ? [
                prisma.user.update({
                  where: { id: user.id },
                  data: {
                    registrationPaid: true,
                    notifications: {
                      push: `Registration fee of ₦${REG_FEE.toLocaleString()} paid successfully. Welcome to MightyShare!`,
                    },
                  },
                }),
              ]
            : []),
        ]);

        // Add notification about top-up
        await prisma.user.update({
          where: { id: user.id },
          data: {
            notifications: {
              push: regDeducted
                ? `Wallet credited with ₦${credit.toLocaleString()} (₦${REG_FEE.toLocaleString()} registration fee deducted from ₦${dbTransaction.amount.toLocaleString()})`
                : `Wallet credited with ₦${credit.toLocaleString()}`,
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Payment verified successfully",
          amount: dbTransaction.amount,
          creditedAmount: credit,
          registrationFeeDeducted: regDeducted ? REG_FEE : 0,
          reference: paymentRef,
          userId: user.id,
          updatedAt: transaction.updatedAt,
        });
      } else {
        return NextResponse.json(
          {
            error:
              response.message ||
              "Payment verification failed - transaction not completed or amount mismatch",
          },
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
    console.error("❌ AlatPay topup verify error:", err);

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
