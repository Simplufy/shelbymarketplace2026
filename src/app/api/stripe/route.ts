import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  console.log('Stripe env check:', { 
    hasKey: !!stripeSecretKey, 
    keyPrefix: stripeSecretKey?.substring(0, 10)
  });
  
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe configuration missing', debug: 'STRIPE_SECRET_KEY not found in env' },
      { status: 500 }
    );
  }
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
  
  try {
    const { package_tier, vehicle_info, selected_addons = [] } = await req.json();
    
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

    const basePrice = prices[package_tier] || 9900;
    const packageName = packageNames[package_tier] || 'Standard Listing';

    const addonCatalog: Record<string, { name: string; amount: number; stripePriceIdEnv?: string }> = {
      carfax_report: { name: 'Vehicle History Report', amount: 2900, stripePriceIdEnv: 'STRIPE_PRICE_CARFAX_REPORT' },
      featured_listing: { name: 'Feature My Listing', amount: 7900, stripePriceIdEnv: 'STRIPE_PRICE_FEATURED_LISTING' },
      social_media_promotion: { name: 'Promote on Social Media', amount: 9900, stripePriceIdEnv: 'STRIPE_PRICE_SOCIAL_PROMOTION' },
      video_showcase: { name: 'Video Showcase', amount: 4900, stripePriceIdEnv: 'STRIPE_PRICE_VIDEO_SHOWCASE' },
      premium_listing_upgrade: { name: 'Premium Listing Upgrade', amount: 12900, stripePriceIdEnv: 'STRIPE_PRICE_PREMIUM_LISTING' },
      concierge_service: { name: 'Concierge Listing Service', amount: 19900, stripePriceIdEnv: 'STRIPE_PRICE_CONCIERGE_SERVICE' },
      pro_seller_package: { name: 'Pro Seller Package', amount: 19900, stripePriceIdEnv: 'STRIPE_PRICE_PRO_SELLER_PACKAGE' },
    };

    const selectedAddonIds = Array.isArray(selected_addons)
      ? selected_addons.filter((id: string) => addonCatalog[id])
      : [];

    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shelby Exchange - ${packageName}`,
            description: `Listing for ${vehicle_info.year} ${vehicle_info.make} ${vehicle_info.model}`,
          },
          unit_amount: basePrice,
        },
        quantity: 1,
      },
    ];

    for (const addonId of selectedAddonIds) {
      const addon = addonCatalog[addonId];
      const configuredPriceId = addon.stripePriceIdEnv ? process.env[addon.stripePriceIdEnv] : undefined;

      if (configuredPriceId) {
        lineItems.push({
          price: configuredPriceId,
          quantity: 1,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shelby Exchange - ${addon.name}`,
              description: `Upsell add-on for ${vehicle_info.year} ${vehicle_info.make} ${vehicle_info.model}`,
            },
            unit_amount: addon.amount,
          },
          quantity: 1,
        });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        package_tier,
        selected_addons: JSON.stringify(selectedAddonIds),
        vehicle_info: JSON.stringify(vehicle_info),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error full:', JSON.stringify(error, null, 2));
    console.error('Stripe error message:', error.message);
    console.error('Stripe error type:', error.type);
    console.error('Stripe error code:', error.code);
    return NextResponse.json(
      { error: error.message || 'Something went wrong', stripeError: error.type },
      { status: 500 }
    );
  }
}
