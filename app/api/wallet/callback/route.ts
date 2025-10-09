import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REG_FEE = 2500;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      return NextResponse.redirect(
        new URL("/dashboard?topup=failed&error=no_reference", req.url)
      );
    }

    // Verify the transaction with Paystack
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.redirect(
        new URL("/dashboard?topup=failed&error=config_error", req.url)
      );
    }

    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = paystackRes.data;

    if (!paystackData.status || !paystackData.data) {
      return NextResponse.redirect(
        new URL("/dashboard?topup=failed&error=verification_failed", req.url)
      );
    }

    const transaction = paystackData.data;

    // Check if payment was successful
    if (transaction.status !== "success") {
      // Update transaction status
      await prisma.transaction.updateMany({
        where: { reference },
        data: {
          status: "failed",
          platformTransactionReference: transaction.reference,
        },
      });

      return NextResponse.redirect(
        new URL(`/dashboard?topup=failed&status=${transaction.status}`, req.url)
      );
    }

    // Get the transaction from our database
    const dbTransaction = await prisma.transaction.findUnique({
      where: { reference },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!dbTransaction) {
      return NextResponse.redirect(
        new URL("/dashboard?topup=failed&error=transaction_not_found", req.url)
      );
    }

    // Check if already processed
    if (dbTransaction.status === "successful") {
      return NextResponse.redirect(
        new URL("/dashboard?topup=success&message=already_processed", req.url)
      );
    }

    const user = dbTransaction.account.user;
    const account = dbTransaction.account;
    const amount = transaction.amount / 100; // Convert from kobo to naira

    // Calculate credit amount (deduct registration fee if needed)
    let credit = amount;
    let regDeducted = false;

    if (!user.registrationPaid) {
      credit = amount - REG_FEE;
      regDeducted = true;
    }

    // Update account balance and transaction status in a transaction
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
        where: { reference },
        data: {
          status: "successful",
          platformTransactionReference: transaction.reference,
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
            ? `Wallet credited with ₦${credit.toLocaleString()} (₦${REG_FEE.toLocaleString()} registration fee deducted from ₦${amount.toLocaleString()})`
            : `Wallet credited with ₦${credit.toLocaleString()}`,
        },
      },
    });

    // Redirect to dashboard with success message
    const message = regDeducted
      ? `success&amount=${credit}&reg_fee=${REG_FEE}`
      : `success&amount=${credit}`;

    return NextResponse.redirect(
      new URL(`/dashboard?topup=${message}`, req.url)
    );
  } catch (err: any) {
    console.error("❌ Wallet callback error:", err);

    if (axios.isAxiosError(err)) {
      console.error("Paystack verification error:", err.response?.data);
    }

    return NextResponse.redirect(
      new URL("/dashboard?topup=failed&error=processing_error", req.url)
    );
  }
}
