// /app/api/paystack/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference && !trxref) {
      return NextResponse.redirect(
        new URL("/register-payment?status=failed&error=no_reference", req.url)
      );
    }

    const paymentReference = reference || trxref;

    // Redirect to register-payment page with reference for verification
    return NextResponse.redirect(
      new URL(
        `/register-payment?reference=${paymentReference}&provider=paystack`,
        req.url
      )
    );
  } catch (err) {
    console.error("❌ Paystack callback error:", err);
    return NextResponse.redirect(
      new URL("/register-payment?status=failed", req.url)
    );
  }
}
