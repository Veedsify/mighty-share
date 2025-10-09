// app/api/settlement-accounts/route.ts
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch settlement accounts for the authenticated user
    const accounts = await prisma.settlementAccount.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error: any) {
    console.error("Settlement account fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { bankName, accountNumber, accountName, isDefault = false } = body;

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.settlementAccount.updateMany({
        where: { userId: decoded.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.settlementAccount.create({
      data: {
        userId: decoded.userId,
        bankName,
        accountNumber,
        accountName,
        isDefault,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    console.error("Settlement account creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
