import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0", 10);

    if (!userId) {
      // If no userId, fetch all accounts (for demo purposes)
      const accounts = await prisma.account.findMany({
        include: {
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

      return NextResponse.json({ accounts });
    }

    // Fetch accounts for specific user
    const accounts = await prisma.account.findMany({
      where: {
        userId,
      },
      include: {
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

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
