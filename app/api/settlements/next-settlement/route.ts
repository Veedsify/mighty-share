import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const nextSettlementAccounts = await prisma.nextSettlementAccount.findMany({
      where: {
        status: "scheduled",
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json({ nextSettlementAccounts });
  } catch (error) {
    console.error("Error fetching next settlement accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch next settlement accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      accountNumber,
      accountName,
      bankName,
      amount,
      scheduledDate,
      settlementCycle,
      priority,
      notes,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const nextSettlementAccount = await prisma.nextSettlementAccount.create({
      data: {
        accountNumber,
        accountName,
        bankName,
        amount,
        scheduledDate: new Date(scheduledDate),
        settlementCycle,
        priority: priority || "normal",
        status: "scheduled",
        notes,
      },
    });

    return NextResponse.json({ nextSettlementAccount }, { status: 201 });
  } catch (error) {
    console.error("Error creating next settlement account:", error);
    return NextResponse.json(
      { error: "Failed to create next settlement account" },
      { status: 500 }
    );
  }
}
