// api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiter (per IP)
const recentRequests = new Map<string, number>();

export const dynamic = "force-dynamic";

interface ContactBody {
  name: string;
  email: string;
  message: string;
  website?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactBody = await req.json();
    const { name, email, message, website } = body || {};

    // Honeypot: if "website" is filled, it's likely a bot
    if (website) {
      return NextResponse.json(
        { ok: false, error: "Spam detected." },
        { status: 400 }
      );
    }

    // Rate limit per IP: 1 request per 30 seconds
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const last = recentRequests.get(ip);
    if (last && now - last < 30000) {
      return NextResponse.json(
        { ok: false, error: "Please wait before submitting again." },
        { status: 429 }
      );
    }
    recentRequests.set(ip, now);

    // Server-side validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "All fields are required." },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Send email via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mighty Share Site" <${
        process.env.MAIL_FROM || process.env.SMTP_USER
      }>`,
      to: process.env.MAIL_TO || "support@mightyshare.com",
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Log message to Database
    try {
      await prisma.message.create({
        data: {
          name,
          email,
          message,
        },
      });
    } catch (dbError) {
      // Don't fail the request if logging fails; just report a soft error
      console.error("Database insert error:", dbError);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
