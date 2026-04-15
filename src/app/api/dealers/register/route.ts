import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

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

    // Update user role to dealer
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'DEALER' })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Create dealer profile
    const { data: dealerProfile, error: dealerError } = await supabase
      .from('dealer_profiles')
      .insert({
        user_id: user.id,
        dealership_name,
        license_number: dealer_license,
        website_url: website || null,
        phone,
        location,
        subscription_tier,
        subscription_status: 'INACTIVE',
      })
      .select()
      .single();

    if (dealerError) {
      console.error('Error creating dealer profile:', dealerError);
      return NextResponse.json({ error: 'Failed to create dealer profile' }, { status: 500 });
    }

    // Create Stripe checkout session for subscription
    const prices: Record<string, number> = {
      'ENTHUSIAST': 40000, // $400.00
      'APEX': 100000, // $1000.00
    };

    const packageNames: Record<string, string> = {
      'ENTHUSIAST': 'Enthusiast Dealer Subscription',
      'APEX': 'Apex Dealer Subscription',
    };

    const price = prices[subscription_tier] || 40000;
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dealers/register?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dealers/register?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        dealer_user_id: dealerProfile.user_id,
        subscription_tier,
        dealership_name,
      },
    });

    return NextResponse.json({ 
      success: true, 
      dealerProfile,
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
