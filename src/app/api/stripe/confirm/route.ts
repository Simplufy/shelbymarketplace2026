import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripeSecretKey } from "@/lib/stripe/config";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfillment";

export async function POST(req: NextRequest) {
  const stripeConfig = getStripeSecretKey();
  if (!stripeConfig.ok) {
    return NextResponse.json({ error: stripeConfig.error }, { status: stripeConfig.status });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { session_id } = await req.json();
  if (!session_id || typeof session_id !== "string") {
    return NextResponse.json({ error: "Missing checkout session" }, { status: 400 });
  }

  const stripe = new Stripe(stripeConfig.key, {
    apiVersion: "2026-03-25.dahlia",
  });

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.client_reference_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return NextResponse.json({ error: "Checkout is not paid yet" }, { status: 409 });
  }

  const result = await fulfillCheckoutSession(session);

  return NextResponse.json({ success: true, ...result });
}
