// app/api/users/registration-complete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing Order Id" }, { status: 400 });
    }

    // Mark registration as paid/complete
    await prisma.user.update({
      where: { id: userId },
      data: { registrationPaid: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ registration-complete route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
