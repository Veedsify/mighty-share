import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import PlanConfig from "@/config/plan";

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
    const planKey = user.plan as keyof typeof PlanConfig;
    const accountLimit = PlanConfig[planKey]?.accountLimit || 1;

    if (currentCount >= accountLimit) {
      return NextResponse.json(
        {
          error: `Account limit reached for plan ${user.plan}. Maximum: ${accountLimit}`,
        },
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
