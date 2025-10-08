import prisma from "@/lib/prisma";

export async function GET() {
  return new Response("✅ Import works!");
}
