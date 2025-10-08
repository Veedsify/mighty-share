// api/messages/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Auth is enforced by middleware; no extra checks here
    const data = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
