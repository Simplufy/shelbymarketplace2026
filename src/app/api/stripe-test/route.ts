import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  return NextResponse.json({
    stripeKey: secretKey ? "present" : "missing",
    stripeMode: secretKey?.startsWith("sk_live_") ? "live" : secretKey ? "test" : "missing",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "present" : "missing",
    productionGuard: process.env.VERCEL_ENV === "production" ? "live key required" : "not production",
  });
}
