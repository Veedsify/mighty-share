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

    // Fetch next settlement accounts for the authenticated user
    const nextSettlementAccounts = await prisma.nextSettlementAccount.findMany({
      where: {
        userId: decoded.userId,
        status: "scheduled",
      },
      include: {
        account: true,
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
      scheduledDate,
      settlementCycle,
      priority,
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

    const nextSettlementAccount = await prisma.nextSettlementAccount.create({
      data: {
        userId: decoded.userId,
        accountId,
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
      include: {
        account: true,
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
