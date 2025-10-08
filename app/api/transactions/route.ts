// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const status = searchParams.get("status");

    if (!accountId) {
      return NextResponse.json(
        { ok: false, error: "Account ID required" },
        { status: 400 }
      );
    }

    // Find account first
    const account = await prisma.account.findFirst({
      where: { accountNumber: accountId },
    });

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Build query
    const where: any = { accountId: account.id };
    if (status) {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, transactions }, { status: 200 });
  } catch (error: any) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountId,
      reference,
      amount,
      type,
      status = "pending",
      paymentMethod,
      description,
      platformTransactionReference,
    } = body;

    if (!accountId || !reference || !amount || !type) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find account
    const account = await prisma.account.findFirst({
      where: { accountNumber: accountId },
    });

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        reference,
        amount,
        type,
        status,
        paymentMethod,
        description,
        platformTransactionReference,
      },
    });

    return NextResponse.json({ ok: true, transaction }, { status: 201 });
  } catch (error: any) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
