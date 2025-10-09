import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const clearanceAccounts = await prisma.settlementClearance.findMany({
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });

    return NextResponse.json({ clearanceAccounts });
  } catch (error) {
    console.error("Error fetching clearance accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch clearance accounts" },
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
      amount,
      bankName,
      dueDate,
      priority,
      notes,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const clearanceAccount = await prisma.settlementClearance.create({
      data: {
        accountNumber,
        accountName,
        amount,
        bankName,
        dueDate: new Date(dueDate),
        priority: priority || "normal",
        notes,
      },
    });

    return NextResponse.json({ clearanceAccount }, { status: 201 });
  } catch (error) {
    console.error("Error creating clearance account:", error);
    return NextResponse.json(
      { error: "Failed to create clearance account" },
      { status: 500 }
    );
  }
}
