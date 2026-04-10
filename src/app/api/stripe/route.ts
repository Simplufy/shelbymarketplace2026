import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Initialize Stripe inside the function to avoid build-time issues
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe configuration missing' },
      { status: 500 }
    );
  }
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
  try {
    const { package_tier, vehicle_info } = await req.json();
    
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
      client_reference_id: user.id,
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
