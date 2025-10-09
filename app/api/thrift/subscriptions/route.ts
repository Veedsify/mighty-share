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

    // Fetch subscriptions for the authenticated user
    const subscriptions = await prisma.thriftSubscription.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend interface
    const transformedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      packageName: sub.package.name,
      amountInvested: sub.amountInvested,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate.toISOString(),
      status: sub.status,
      expectedReturn: sub.expectedReturn,
      actualReturn: sub.actualReturn,
      duration: sub.package.duration,
      profitPercentage: sub.package.profitPercentage,
    }));

    return NextResponse.json({ subscriptions: transformedSubscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { packageId, amountInvested } = body;

    if (!packageId || !amountInvested) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the package details
    const thriftPackage = await prisma.thriftPackage.findUnique({
      where: { id: packageId },
    });

    if (!thriftPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Calculate end date and expected return
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + thriftPackage.duration * 7); // Convert weeks to days

    const expectedReturn =
      amountInvested + (amountInvested * thriftPackage.profitPercentage) / 100;

    const subscription = await prisma.thriftSubscription.create({
      data: {
        userId: decoded.userId,
        packageId,
        amountInvested,
        startDate,
        endDate,
        expectedReturn,
        status: "active",
      },
      include: {
        package: true,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
