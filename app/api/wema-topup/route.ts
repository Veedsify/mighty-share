// app/api/wema-topup/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface WemaTopupRequest {
  sourceAccountNumber: string;
  narration: string;
  transactionReference: string;
  amount: number;
  user_id: number;
}

export async function POST(req: NextRequest) {
  try {
    const data: WemaTopupRequest = await req.json();

    // Replace with your Wema channelId and other credentials
    const channelId = "your_channel_id";
    const baseUrl = "https://alatpay-dev.azurewebsites.net"; // From docs

    const res = await fetch(
      `${baseUrl}/pay-with-bank-account/api/EcommerceTransfer/v2/transfer-fund-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if required (e.g., API Key from Wema dashboard)
          Authorization: "Bearer your_wema_token",
        },
        body: JSON.stringify({
          sourceAccountNumber: data.sourceAccountNumber,
          channelId,
          narration: data.narration,
          transactionReference: data.transactionReference,
          amount: data.amount,
        }),
      }
    );

    const responseData = await res.json();

    if (res.ok) {
      // Update wallet balance if successful
      const account = await prisma.account.findFirst({
        where: { userId: data.user_id },
      });

      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: data.amount } },
        });
      }

      return NextResponse.json({
        ok: true,
        platformTransactionReference: responseData.platformTransactionReference,
      });
    } else {
      throw new Error(responseData.error || "Payment failed");
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
