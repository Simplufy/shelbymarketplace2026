import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripeKey: process.env.STRIPE_SECRET_KEY ? "present" : "missing",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "present" : "missing",
  });
}