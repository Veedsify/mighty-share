// /app/api/alatpay/initialize/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const uuid = uuidv4();
    const orderId = `ORD` + uuid.slice(0, 10);
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
    if (!process.env.NEXT_PUBLIC_ALATPAY_PUBLIC_KEY) {
      console.error("ALATPAY_API_KEY is not configured");
      return NextResponse.json(
        { error: "Payment service is not properly configured" },
        { status: 500 }
      );
    }

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency,
        description,
        status: "PENDING",
        businessId: "27a4ed9c-e6db-490e-1495-08ddfceabbff",
        customerEmail: `${user.fullname.split(" ")[0]}-${
          user.phone
        }@mightyshare.com`,
        customerFirstName: user.fullname.split(" ")[0] || user.fullname,
        customerLastName: user.fullname.split(" ")[1] || user.fullname,
        customerPhone: user.phone,
        orderId: orderId,
        customerMetadata: JSON.stringify({
          OtherName: user.fullname,
          userId: user.id,
        }),
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    const res = await axios.post(
      "https://apibox.alatpay.ng/bank-transfer/api/v1/bankTransfer/virtualAccount",
      {
        businessId: "27a4ed9c-e6db-490e-1495-08ddfceabbff",
        amount: amount,
        currency: "NGN",
        orderId: orderId,
        description,
        customer: {
          email: `${user.fullname.split(" ")[0]}-${user.phone}@mightyshare.com`,
          phone: user.phone,
          firstName: user.fullname.split(" ")[0] || user.fullname,
          lastName: user.fullname.split(" ")[1] || user.fullname,
          metadata: JSON.stringify({
            OtherName: user.fullname,
          }),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key":
            process.env.NEXT_PUBLIC_ALATPAY_SECRET_KEY,
        },
      }
    );
    const data = res.data;
    if (res.status === 200 && data.status === "success") {
      return NextResponse.json({
        alatPayData: data,
        paymentUrl: data.data?.paymentUrl || data.data?.checkoutUrl || null,
        reference: orderId,
      });
    } else {
      return NextResponse.json(
        { error: data.message || "ALATPay failed" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("ALATPay error:", err.response);

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
