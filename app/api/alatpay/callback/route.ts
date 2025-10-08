import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CallbackBody {
  reference: string;
  status: string;
  amount: number;
  customer?: {
    phone?: string;
    email?: string;
  };
}

// Handle GET redirects from AlatPay
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const reference = searchParams.get("reference");
    const status = searchParams.get("status");

    if (!orderId && !reference) {
      return NextResponse.redirect(
        new URL("/register-payment?status=failed&error=no_reference", req.url)
      );
    }

    const paymentReference = orderId || reference;

    // Redirect to register-payment page with reference for verification
    return NextResponse.redirect(
      new URL(
        `/register-payment?reference=${paymentReference}&provider=alatpay&status=${
          status || "pending"
        }`,
        req.url
      )
    );
  } catch (err) {
    console.error("❌ AlatPay callback GET error:", err);
    return NextResponse.redirect(
      new URL("/register-payment?status=failed", req.url)
    );
  }
}

// Handle POST webhooks from AlatPay
export async function POST(req: NextRequest) {
  try {
    const body: CallbackBody = await req.json();
    const { reference, status, amount, customer } = body;

    // ✅ Verify status with ALATpay API (recommended)
    const verifyRes = await fetch(
      `https://api.alatpay.com/checkout/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.ALATPAY_SECRET_KEY}`,
        },
      }
    );
    const verifyData = await verifyRes.json();

    if (verifyData?.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    // ✅ Find user by phone/email (assuming ALATpay returns it in customer)
    const phone = customer?.phone || null;
    let user = null;

    if (phone) {
      user = await prisma.user.findUnique({
        where: { phone },
        include: { accounts: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Deduct registration fee (if not already paid)
    let registrationPaid = user.registrationPaid;
    let balanceToCredit = amount;

    if (!registrationPaid) {
      if (amount >= 2500) {
        balanceToCredit = amount - 2500;
        registrationPaid = true;
      } else {
        balanceToCredit = 0; // registration not complete
      }
    }

    // ✅ Update user + wallet
    const firstAccount = user.accounts?.[0];

    if (firstAccount) {
      await prisma.account.update({
        where: { id: firstAccount.id },
        data: { balance: { increment: balanceToCredit } },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        registrationPaid,
        lastActivity: `Payment verified (${amount})`,
        notifications: {
          push: `✅ Payment of ₦${amount} received.`,
        },
      },
      include: { accounts: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("ALATpay callback error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
