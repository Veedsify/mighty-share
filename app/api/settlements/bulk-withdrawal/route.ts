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

    // Fetch bulk withdrawal requests for the authenticated user
    const bulkRequests = await prisma.bulkWithdrawalRequest.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bulkRequests });
  } catch (error) {
    console.error("Error fetching bulk requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch bulk requests" },
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
    const { accountNumbers, totalAmount, requestedBy, notes } = body;

    // Generate unique request ID
    const requestId = `BWR-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;

    const bulkRequest = await prisma.bulkWithdrawalRequest.create({
      data: {
        userId: decoded.userId,
        requestId,
        accountNumbers,
        totalAmount,
        requestedBy,
        notes,
        status: "pending",
      },
    });

    return NextResponse.json({ bulkRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk request:", error);
    return NextResponse.json(
      { error: "Failed to create bulk request" },
      { status: 500 }
    );
  }
}
