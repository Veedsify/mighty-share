import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PLAN_LIMITS = {
  A: { min: 1, max: 100 },
  B: { min: 1, max: 500 },
  C: { min: 10, max: 1000 },
};

const formatAccountId = (timestamp: number) => `MS${timestamp}`;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentCount = user.accounts.length;
    const limits = PLAN_LIMITS[user.plan as "A" | "B" | "C"] || {
      min: 1,
      max: 1,
    };

    if (currentCount >= limits.max) {
      return NextResponse.json(
        { error: `Account limit reached for plan ${user.plan}` },
        { status: 403 }
      );
    }

    const accountNumber = formatAccountId(Date.now());

    const account = await prisma.account.create({
      data: {
        accountNumber,
        balance: 0,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, account });
  } catch (e: any) {
    console.error("Add account error:", e);
    return NextResponse.json(
      { error: e.message || "Add account failed" },
      { status: 500 }
    );
  }
}
