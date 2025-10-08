// /app/api/paystack/initialize/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const uuid = uuidv4();
    const reference = `PS-${uuid.slice(0, 16)}`;

    const headers = req.headers.get("cookie");
    const token = headers
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const request = await req.json();
    const { amount, currency, description } = request;

    // Validate required fields
    if (!amount || !currency || !description) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, or description" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service is not properly configured" },
        { status: 500 }
      );
    }

    // Create payment record in database
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency,
        description,
        status: "PENDING",
        businessId: "paystack",
        customerEmail: `${user.fullname.split(" ")[0]}-${
          user.phone
        }@mightyshare.com`,
        customerFirstName: user.fullname.split(" ")[0] || user.fullname,
        customerLastName: user.fullname.split(" ")[1] || user.fullname,
        customerPhone: user.phone,
        orderId: reference,
        customerMetadata: JSON.stringify({
          OtherName: user.fullname,
          userId: user.id,
          paymentMethod: "paystack",
        }),
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    // Initialize Paystack transaction
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: `${user.fullname.split(" ")[0]}-${user.phone}@mightyshare.com`,
        amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        currency: currency || "NGN",
        reference: reference,
        callback_url: `${baseUrl}/api/paystack/callback`,
        metadata: {
          userId: user.id,
          fullname: user.fullname,
          phone: user.phone,
          description: description,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = res.data;

    if (data.status && data.data.authorization_url) {
      return NextResponse.json({
        paystackData: data.data,
        paymentUrl: data.data.authorization_url,
        reference: reference,
      });
    } else {
      return NextResponse.json(
        { error: data.message || "Paystack initialization failed" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Paystack error:", err.response?.data || err.message);

    // Provide more detailed error information
    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status || 500;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment initialization failed";

      return NextResponse.json(
        { error: errorMessage, details: err.response?.data },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Payment initialization error", details: err.message },
      { status: 500 }
    );
  }
}
