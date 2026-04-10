import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Initialize Stripe inside the function to avoid build-time issues
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripeSecretKey || !webhookSecret) {
    console.error('Missing Stripe environment variables');
    return NextResponse.json(
      { error: 'Stripe configuration missing' },
      { status: 500 }
    );
  }
  
  const stripe = new Stripe(stripeSecretKey, {
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
      // Get metadata from the session
      const { package_tier, vehicle_info } = session.metadata || {};
      const vehicleData = JSON.parse(vehicle_info || '{}');

      // Create the listing in Supabase
      const supabase = await createClient();
      
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          user_id: session.client_reference_id,
          vin: vehicleData.vin,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          trim: vehicleData.trim,
          price: vehicleData.price,
          mileage: vehicleData.mileage,
          description: vehicleData.description,
          location: vehicleData.location,
          package_tier: package_tier,
          status: 'PENDING',
          transmission: vehicleData.transmission || 'Automatic',
          drivetrain: vehicleData.drivetrain || 'RWD',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
      }

      // Add service history if provided
      if (vehicleData.serviceHistory && vehicleData.serviceHistory.length > 0) {
        const serviceRecords = vehicleData.serviceHistory
          .filter((record: any) => record.date && record.type)
          .map((record: any) => ({
            listing_id: listing.id,
            feature: `${record.date}: ${record.type} - ${record.description} (${record.mileage} mi)`,
          }));

        if (serviceRecords.length > 0) {
          await supabase.from('listing_features').insert(serviceRecords);
        }
      }

      // Add images if provided
      if (vehicleData.images && vehicleData.images.length > 0) {
        const imageRecords = vehicleData.images.map((img: any, index: number) => ({
          listing_id: listing.id,
          url: img.url,
          storage_path: img.storagePath,
          is_primary: index === 0,
          order_index: index,
        }));

        await supabase.from('listing_images').insert(imageRecords);
      }

      console.log('Listing created successfully:', listing.id);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
