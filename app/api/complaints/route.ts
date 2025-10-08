// app/api/complaints/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const where: any = { userId: parseInt(userId) };
    if (status) {
      where.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, complaints }, { status: 200 });
  } catch (error: any) {
    console.error("Complaint fetch error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, description, category, priority = "normal" } = body;

    if (!userId || !title || !description || !category) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: parseInt(userId),
        title,
        description,
        category,
        priority,
      },
    });

    return NextResponse.json({ ok: true, complaint }, { status: 201 });
  } catch (error: any) {
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
