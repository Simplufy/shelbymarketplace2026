import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripe/config';
import { fulfillCheckoutSession } from '@/lib/stripe/fulfillment';

export async function POST(req: NextRequest) {
  const stripeConfig = getStripeSecretKey();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripeConfig.ok || !webhookSecret) {
    console.error('Missing Stripe environment variables');
    return NextResponse.json(
      { error: stripeConfig.ok ? 'Stripe webhook configuration missing' : stripeConfig.error },
      { status: 500 }
    );
  }
  
  const stripe = new Stripe(stripeConfig.key, {
    apiVersion: '2026-03-25.dahlia',
  });
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      const result = await fulfillCheckoutSession(session);
      console.log('Stripe checkout fulfilled:', result);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
