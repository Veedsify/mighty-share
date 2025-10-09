import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const paidAccounts = await prisma.paidSettlementAccount.findMany({
      orderBy: {
        settlementDate: "desc",
      },
    });

    return NextResponse.json({ paidAccounts });
  } catch (error) {
    console.error("Error fetching paid accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch paid accounts" },
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
      reference,
      paymentMethod,
      notes,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const paidAccount = await prisma.paidSettlementAccount.create({
      data: {
        accountNumber,
        accountName,
        bankName,
        amount,
        settlementDate: new Date(),
        reference,
        paymentMethod,
        notes,
      },
    });

    return NextResponse.json({ paidAccount }, { status: 201 });
  } catch (error) {
    console.error("Error creating paid account:", error);
    return NextResponse.json(
      { error: "Failed to create paid account" },
      { status: 500 }
    );
  }
}
