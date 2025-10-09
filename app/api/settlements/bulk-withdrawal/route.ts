import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const bulkRequests = await prisma.bulkWithdrawalRequest.findMany({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, accountNumbers, totalAmount, requestedBy, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Generate unique request ID
    const requestId = `BWR-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;

    const bulkRequest = await prisma.bulkWithdrawalRequest.create({
      data: {
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
