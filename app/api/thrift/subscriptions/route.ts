import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);

    if (!userId) {
      // For demo, fetch all subscriptions
      const subscriptions = await prisma.thriftSubscription.findMany({
        include: {
          package: true,
          user: {
            select: {
              id: true,
              fullname: true,
            },
          },
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
    }

    const subscriptions = await prisma.thriftSubscription.findMany({
      where: {
        userId,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, packageId, amountInvested } = body;

    if (!userId || !packageId || !amountInvested) {
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
        userId,
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
