import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  const stripeConfig = getStripeSecretKey();
  if (!stripeConfig.ok) {
    return NextResponse.json(
      { error: stripeConfig.error },
      { status: stripeConfig.status }
    );
  }
  
  const stripe = new Stripe(stripeConfig.key, {
    apiVersion: '2026-03-25.dahlia',
  });
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const {
      dealership_name,
      dealer_license,
      website,
      phone,
      location,
      subscription_tier,
    } = await req.json();

    // Validate required fields
    if (!dealership_name || !dealer_license || !phone || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prices: Record<string, number> = {
      'ENTHUSIAST': 39900, // $399.00
      'GROWTH': 59900, // $599.00
      'APEX': 99900, // $999.00
    };

    const packageNames: Record<string, string> = {
      'ENTHUSIAST': 'Starter Dealer Subscription',
      'GROWTH': 'Growth Dealer Subscription',
      'APEX': 'Apex Dealer Subscription',
    };

    const price = prices[subscription_tier] || 39900;
    const packageName = packageNames[subscription_tier] || 'Dealer Subscription';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shelby Exchange - ${packageName}`,
              description: `Monthly subscription for ${dealership_name}`,
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dealers/register?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dealers/register?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        dealer_user_id: user.id,
        subscription_tier,
        dealership_name,
        dealer_license,
        website: website || '',
        phone,
        location,
        stripe_livemode: String(stripeConfig.livemode),
      },
    });

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: session.url,
    });

  } catch (error: any) {
    console.error('Dealer registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
