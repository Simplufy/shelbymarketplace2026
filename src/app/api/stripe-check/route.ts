import { NextResponse } from "next/server";
import Stripe from 'stripe';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    return NextResponse.json({ error: "No key" }, { status: 500 });
  }
  
  try {
    const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
    // Just try to create a test checkout session to verify the key works
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test' },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      cancel_url: 'https://example.com/cancel',
      success_url: 'https://example.com/success',
    });
    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      type: e.type, 
      code: e.code,
      param: e.param 
    }, { status: 500 });
  }
}