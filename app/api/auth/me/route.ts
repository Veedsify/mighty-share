import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // ✅ Read cookie directly
    const authorizationHeader = req.headers.get("Authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = authorizationHeader.split(" ")[1];
    // Validate the token and proceed with your logic
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
