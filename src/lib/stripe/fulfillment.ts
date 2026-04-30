import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

async function createFulfillmentSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (supabaseUrl && serviceKey) {
    return createSupabaseAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient();
}

function parseVehicleInfo(metadata: Stripe.Metadata | null) {
  const chunkCount = Number(metadata?.vehicle_chunks || 0);
  let vehicleInfoPayload = metadata?.vehicle_info || "";

  if (chunkCount > 0) {
    vehicleInfoPayload = Array.from({ length: chunkCount }, (_, idx) => metadata?.[`vehicle_chunk_${idx}`] || "").join("");
  }

  return JSON.parse(vehicleInfoPayload || "{}");
}

async function findListingByCheckoutSession(supabase: Awaited<ReturnType<typeof createFulfillmentSupabaseClient>>, sessionId: string) {
  const { data: feature } = await supabase
    .from("listing_features")
    .select("listing_id")
    .eq("feature", `Stripe checkout session: ${sessionId}`)
    .maybeSingle();

  return feature?.listing_id || null;
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const supabase = await createFulfillmentSupabaseClient();

  if (metadata.dealer_user_id) {
    const subscriptionTier = metadata.subscription_tier || "ENTHUSIAST";

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "DEALER", updated_at: new Date().toISOString() })
      .eq("id", metadata.dealer_user_id);

    if (profileError) {
      throw new Error(`Failed to activate dealer profile role: ${profileError.message}`);
    }

    const { error: dealerError } = await supabase
      .from("dealer_profiles")
      .upsert({
        user_id: metadata.dealer_user_id,
        dealership_name: metadata.dealership_name,
        license_number: metadata.dealer_license,
        website_url: metadata.website || null,
        phone: metadata.phone,
        location: metadata.location,
        subscription_tier: subscriptionTier,
        subscription_status: "ACTIVE",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (dealerError) {
      throw new Error(`Failed to activate dealer profile: ${dealerError.message}`);
    }

    return { type: "dealer" as const };
  }

  if (session.id) {
    const existingListingId = await findListingByCheckoutSession(supabase, session.id);
    if (existingListingId) {
      return { type: "listing" as const, listingId: existingListingId, alreadyFulfilled: true };
    }
  }

  const { package_tier, selected_addons } = metadata;
  const vehicleData = parseVehicleInfo(metadata);
  const selectedAddonIds: string[] = JSON.parse(selected_addons || "[]");

  const featuredByPackage = package_tier === "HOMEPAGE" || package_tier === "HOMEPAGE_PLUS_ADS";
  const featuredByAddon =
    selectedAddonIds.includes("featured_listing") ||
    selectedAddonIds.includes("pro_seller_package");

  const stripUnsupportedListingColumns = (payload: Record<string, any>, message?: string) => {
    if (!message) return payload;
    const next = { ...payload };
    if (message.includes("'listing_tags'")) delete next.listing_tags;
    if (message.includes("'service_history'")) delete next.service_history;
    return next;
  };

  const listingInsertPayload: Record<string, any> = {
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
    package_tier,
    status: "PENDING",
    is_featured: featuredByPackage || featuredByAddon,
    transmission: vehicleData.transmission || "Automatic",
    drivetrain: vehicleData.drivetrain || "RWD",
    engine: vehicleData.engine || null,
    listing_tags: vehicleData.listingTags && vehicleData.listingTags.length > 0
      ? vehicleData.listingTags
      : null,
    service_history: vehicleData.serviceHistory && vehicleData.serviceHistory.length > 0
      ? vehicleData.serviceHistory.filter((r: any) => r.date || r.type || r.description)
      : null,
  };

  let { data: listing, error } = await supabase
    .from("listings")
    .insert(listingInsertPayload)
    .select()
    .single();

  if (error?.message?.includes("Could not find the '")) {
    const sanitized = stripUnsupportedListingColumns(listingInsertPayload, error.message);
    if (JSON.stringify(sanitized) !== JSON.stringify(listingInsertPayload)) {
      ({ data: listing, error } = await supabase
        .from("listings")
        .insert(sanitized)
        .select()
        .single());
    }
  }

  if (error || !listing) {
    throw new Error(`Failed to create listing: ${error?.message || "No listing returned"}`);
  }

  const featureRecords: { listing_id: string; feature: string }[] = [];

  if (session.id) {
    featureRecords.push({ listing_id: listing.id, feature: `Stripe checkout session: ${session.id}` });
  }

  if (vehicleData.serviceHistory && vehicleData.serviceHistory.length > 0) {
    featureRecords.push(
      ...vehicleData.serviceHistory
        .filter((record: any) => record.date && record.type)
        .map((record: any) => ({
          listing_id: listing.id,
          feature: `${record.date}: ${record.type} - ${record.description} (${record.mileage} mi)`,
        }))
    );
  }

  if (selectedAddonIds.length > 0) {
    const addonLabels: Record<string, string> = {
      carfax_report: "Upsell: Vehicle History Report included",
      featured_listing: "Upsell: Featured Listing enabled",
      social_media_promotion: "Upsell: Social Media Promotion included",
      email_blast: "Upsell: Email Blast included",
      urgent_badge: "Upsell: Urgent Badge included",
      video_showcase: "Upsell: Video Showcase included",
      concierge_service: "Upsell: Concierge Service purchased (writing, optimization, photo positioning)",
      pro_seller_package: "Upsell: Pro Seller Package enabled",
    };

    featureRecords.push(
      ...selectedAddonIds
        .filter((id) => addonLabels[id])
        .map((id) => ({
          listing_id: listing.id,
          feature: addonLabels[id],
        }))
    );

    if (selectedAddonIds.includes("pro_seller_package")) {
      featureRecords.push(
        { listing_id: listing.id, feature: "Bundle: Email blast included" },
        { listing_id: listing.id, feature: "Bundle: Urgent badge included" }
      );
    }
  }

  if (featureRecords.length > 0) {
    await supabase.from("listing_features").insert(featureRecords);
  }

  if (vehicleData.images && vehicleData.images.length > 0) {
    const primaryIdx = typeof vehicleData.primaryImageIndex === "number" ? vehicleData.primaryImageIndex : 0;
    const imageRecords = vehicleData.images.map((img: any, index: number) => ({
      listing_id: listing.id,
      url: img.url,
      storage_path: img.storagePath,
      is_primary: index === primaryIdx,
      order_index: index,
    }));

    await supabase.from("listing_images").insert(imageRecords);
  }

  let profileEmail: string | undefined;
  let profileFirstName: string | undefined;
  let profileLastName: string | undefined;
  if (session.client_reference_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", session.client_reference_id)
      .single();
    profileEmail = profile?.email;
    profileFirstName = profile?.first_name || undefined;
    profileLastName = profile?.last_name || undefined;
  }

  const klaviyoProperties = {
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
  };

  if (profileEmail) {
    await subscribeKlaviyoEmail({
      email: profileEmail,
      firstName: profileFirstName,
      lastName: profileLastName,
      source: "seller_listing_submit",
      properties: {
        seller_activity: true,
        ...klaviyoProperties,
      },
    });
  }

  await trackKlaviyoEvent({
    metricName: "New listing created",
    profile: {
      email: profileEmail,
      first_name: profileFirstName,
      last_name: profileLastName,
      external_id: session.client_reference_id || undefined,
    },
    properties: klaviyoProperties,
  });

  return { type: "listing" as const, listingId: listing.id, alreadyFulfilled: false };
}
