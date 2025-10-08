import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // get JWT cookie
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { registrationPaid: true },
      include: { accounts: true },
    });

    return NextResponse.json({ user, message: "Registration fee marked as paid" });
  } catch (err: any) {
    console.error("Register-payment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
