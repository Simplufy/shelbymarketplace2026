import { NextResponse } from "next/server";
import Stripe from 'stripe';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  
  console.log('Testing Stripe with key prefix:', key?.substring(0, 15));
  
  if (!key) {
    console.log('No STRIPE_SECRET_KEY found');
    return NextResponse.json({ error: "No key" }, { status: 500 });
  }
  
  try {
    const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
    // Try to list prices - this will fail if the key is invalid
    const prices = await stripe.prices.list({ limit: 1 });
    console.log('Stripe test success, prices:', prices.data.length);
    return NextResponse.json({ success: true, keyPrefix: key.substring(0, 15) });
  } catch (e: any) {
    console.log('Stripe error:', e.message, e.type, e.code);
    return NextResponse.json({ 
      error: e.message, 
      type: e.type, 
      code: e.code,
      keyPrefix: key.substring(0, 15)
    }, { status: 500 });
  }
}