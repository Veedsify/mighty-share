import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.thriftPackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: "asc",
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching thrift packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch thrift packages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      duration,
      profitPercentage,
      description,
      terms,
      minContribution,
      maxContribution,
      features,
    } = body;

    const thriftPackage = await prisma.thriftPackage.create({
      data: {
        name,
        price,
        duration,
        profitPercentage,
        description,
        terms,
        minContribution,
        maxContribution,
        features: features || [],
        isActive: true,
      },
    });

    return NextResponse.json({ thriftPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating thrift package:", error);
    return NextResponse.json(
      { error: "Failed to create thrift package" },
      { status: 500 }
    );
  }
}
