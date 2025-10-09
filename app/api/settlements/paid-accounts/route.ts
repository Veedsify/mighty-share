import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Extract token from cookie or Authorization header
    let token = cookies().get("token")?.value;

    if (!token) {
      const authorizationHeader = req.headers.get("Authorization");
      if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Verify user exists and get their accounts
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch paid accounts for the authenticated user
    const paidAccounts = await prisma.paidSettlementAccount.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        account: true,
      },
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

export async function POST(req: NextRequest) {
  try {
    // Extract token from cookie or Authorization header
    let token = cookies().get("token")?.value;

    if (!token) {
      const authorizationHeader = req.headers.get("Authorization");
      if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Verify user exists and get their accounts
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      accountId,
      accountNumber,
      accountName,
      bankName,
      amount,
      reference,
      paymentMethod,
      notes,
    } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user
    const accountBelongsToUser = user.accounts.some(
      (acc) => acc.id === accountId
    );

    if (!accountBelongsToUser) {
      return NextResponse.json(
        { error: "Account does not belong to user" },
        { status: 403 }
      );
    }

    const paidAccount = await prisma.paidSettlementAccount.create({
      data: {
        userId: decoded.userId,
        accountId,
        accountNumber,
        accountName,
        bankName,
        amount,
        settlementDate: new Date(),
        reference,
        paymentMethod,
        notes,
      },
      include: {
        account: true,
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
