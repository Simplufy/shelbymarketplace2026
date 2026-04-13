import { NextResponse } from "next/server";
import Stripe from 'stripe';

export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    return NextResponse.json({ error: "No key" }, { status: 500 });
  }
  
  try {
    const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
    const account = await stripe.account.retrieve();
    return NextResponse.json({ success: true, accountId: account.id });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      type: e.type, 
      code: e.code,
      param: e.param 
    }, { status: 500 });
  }
}