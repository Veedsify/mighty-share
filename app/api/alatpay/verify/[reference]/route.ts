import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { reference } = params;

    // 1️⃣ Verify with ALATPay
    const resp = await fetch(
      `https://alatpay.ng/api/payments/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ALATPAY_SECRET_KEY}`,
        },
      }
    );

    const data = await resp.json();
    if (!resp.ok || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const { metadata, amount } = data.data;
    const { userId, accountId } = metadata;

    // 2️⃣ Update Database
    // Find account by accountNumber
    const account = await prisma.account.findUnique({
      where: { accountNumber: accountId },
    });

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { balance: { increment: amount } },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { registrationPaid: true },
    });

    // 3️⃣ Return response to frontend
    return NextResponse.json({ success: true, wallet_balance: amount });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
