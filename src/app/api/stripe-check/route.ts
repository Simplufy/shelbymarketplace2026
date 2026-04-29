import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { requireAdmin } from '@/lib/admin/requireAdmin';
import { getStripeSecretKey } from '@/lib/stripe/config';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const stripeConfig = getStripeSecretKey();

  if (!stripeConfig.ok) {
    return NextResponse.json({ error: stripeConfig.error }, { status: stripeConfig.status });
  }
  
  try {
    const stripe = new Stripe(stripeConfig.key, { apiVersion: '2026-03-25.dahlia' });
    // Try to list prices - this will fail if the key is invalid
    const prices = await stripe.prices.list({ limit: 1 });
    console.log('Stripe test success, prices:', prices.data.length);
    return NextResponse.json({ success: true, mode: stripeConfig.livemode ? "live" : "test" });
  } catch (e: any) {
    console.log('Stripe error:', e.message, e.type, e.code);
    return NextResponse.json({ 
      error: e.message, 
      type: e.type, 
      code: e.code,
    }, { status: 500 });
  }
}
