import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { trackKlaviyoEvent } from '@/lib/klaviyo/server';

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
      const metadata = session.metadata || {};
      const { package_tier, selected_addons } = metadata;
      const chunkCount = Number(metadata.vehicle_chunks || 0);
      let vehicleInfoPayload = metadata.vehicle_info || '';

      if (chunkCount > 0) {
        vehicleInfoPayload = Array.from({ length: chunkCount }, (_, idx) => metadata[`vehicle_chunk_${idx}`] || '').join('');
      }

      const vehicleData = JSON.parse(vehicleInfoPayload || '{}');
      const selectedAddonIds: string[] = JSON.parse(selected_addons || '[]');

      const featuredByPackage = package_tier === 'HOMEPAGE' || package_tier === 'HOMEPAGE_PLUS_ADS';
      const featuredByAddon =
        selectedAddonIds.includes('featured_listing') ||
        selectedAddonIds.includes('premium_listing_upgrade') ||
        selectedAddonIds.includes('pro_seller_package');

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
          is_featured: featuredByPackage || featuredByAddon,
          transmission: vehicleData.transmission || 'Automatic',
          drivetrain: vehicleData.drivetrain || 'RWD',
          engine: vehicleData.engine || null,
          listing_tags: vehicleData.listingTags && vehicleData.listingTags.length > 0
            ? vehicleData.listingTags
            : null,
          service_history: vehicleData.serviceHistory && vehicleData.serviceHistory.length > 0
            ? JSON.stringify(vehicleData.serviceHistory.filter((r: any) => r.date || r.type || r.description))
            : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
      }

      // Add service history if provided (stored as features for backward compatibility)
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

      // Add purchased upsell features
      if (selectedAddonIds.length > 0) {
        const addonLabels: Record<string, string> = {
          carfax_report: 'Upsell: Vehicle History Report included',
          featured_listing: 'Upsell: Featured Listing enabled',
          social_media_promotion: 'Upsell: Social Media Promotion included',
          video_showcase: 'Upsell: Video Showcase included',
          premium_listing_upgrade: 'Upsell: Premium Listing Upgrade enabled',
          concierge_service: 'Upsell: Concierge Service purchased (writing, optimization, photo positioning)',
          pro_seller_package: 'Upsell: Pro Seller Package enabled',
        };

        const addonFeatures = selectedAddonIds
          .filter((id) => addonLabels[id])
          .map((id) => ({
            listing_id: listing.id,
            feature: addonLabels[id],
          }));

        // Bundle fulfillment notes
        if (selectedAddonIds.includes('pro_seller_package')) {
          addonFeatures.push(
            { listing_id: listing.id, feature: 'Bundle: Email blast included' },
            { listing_id: listing.id, feature: 'Bundle: Urgent badge included' }
          );
        }

        if (addonFeatures.length > 0) {
          await supabase.from('listing_features').insert(addonFeatures);
        }
      }

      // Add images if provided
      if (vehicleData.images && vehicleData.images.length > 0) {
        const primaryIdx = typeof vehicleData.primaryImageIndex === 'number' ? vehicleData.primaryImageIndex : 0;
        const imageRecords = vehicleData.images.map((img: any, index: number) => ({
          listing_id: listing.id,
          url: img.url,
          storage_path: img.storagePath,
          is_primary: index === primaryIdx,
          order_index: index,
        }));

        await supabase.from('listing_images').insert(imageRecords);
      }

      let profileEmail: string | undefined;
      if (session.client_reference_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.client_reference_id)
          .single();
        profileEmail = profile?.email;
      }

      await trackKlaviyoEvent({
        metricName: 'New listing created',
        profile: {
          email: profileEmail,
          external_id: session.client_reference_id || undefined,
        },
        properties: {
          listing_id: listing.id,
          vehicle_name: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          trim: vehicleData.trim || null,
          price: vehicleData.price,
          image: vehicleData.images?.[0]?.url || null,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listing.id}`,
          location: vehicleData.location,
        },
      });

      console.log('Listing created successfully:', listing.id);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
