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

    // Verify token
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

    // Verify token
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
