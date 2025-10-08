// app/api/settlement-accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const accounts = await prisma.settlementAccount.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, accounts }, { status: 200 });
  } catch (error: any) {
    console.error("Settlement account fetch error:", error);
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
      userId,
      bankName,
      accountNumber,
      accountName,
      isDefault = false,
    } = body;

    if (!userId || !bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.settlementAccount.updateMany({
        where: { userId: parseInt(userId), isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.settlementAccount.create({
      data: {
        userId: parseInt(userId),
        bankName,
        accountNumber,
        accountName,
        isDefault,
      },
    });

    return NextResponse.json({ ok: true, account }, { status: 201 });
  } catch (error: any) {
    console.error("Settlement account creation error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
