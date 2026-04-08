import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: NextRequest) {
  try {
    const { package_tier, vehicle_info } = await req.json();

    // Define prices for each package
    const prices: Record<string, number> = {
      'STANDARD': 9900, // $99.00
      'HOMEPAGE': 14900, // $149.00
      'HOMEPAGE_PLUS_ADS': 29900, // $299.00
    };

    const packageNames: Record<string, string> = {
      'STANDARD': 'Standard Listing',
      'HOMEPAGE': 'Homepage Featured',
      'HOMEPAGE_PLUS_ADS': 'Homepage + Google Ads',
    };

    const price = prices[package_tier] || 9900;
    const packageName = packageNames[package_tier] || 'Standard Listing';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shelby Exchange - ${packageName}`,
              description: `Listing for ${vehicle_info.year} ${vehicle_info.make} ${vehicle_info.model}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?canceled=true`,
      metadata: {
        package_tier,
        vehicle_info: JSON.stringify(vehicle_info),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
