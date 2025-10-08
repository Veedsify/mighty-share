import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fullname, phone, password, plan, referralId } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Auto-generate referralId if not passed
    const finalReferralId =
      referralId && referralId.trim().length > 0
        ? referralId
        : `REF-${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        fullname,
        phone,
        password: hashedPassword,
        plan,
        referralId: finalReferralId, // always defined
        registrationPaid: false,
        accounts: {
          create: {
            accountNumber: `MS${Date.now()}`,
            balance: 0,
          },
        },
      },
      include: { accounts: true },
    });

    // JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set cookie
    const res = NextResponse.json({ user });
    
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
