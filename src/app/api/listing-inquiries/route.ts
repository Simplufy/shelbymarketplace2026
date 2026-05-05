import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function vehicleLabelFor(listing: any) {
  return [listing.year, listing.make, listing.model, listing.trim]
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "listing-inquiries", { windowMs: 15 * 60 * 1000, max: 8 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many inquiry attempts. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const listing_id = cleanString(body.listing_id, 80);
    const name = cleanString(body.name, 120);
    const email = cleanString(body.email, 180).toLowerCase();
    const phone = cleanString(body.phone, 40);
    const message = cleanString(body.message, 2000);

    if (!listing_id || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const sessionClient = await createServerClient();
    await sessionClient.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    const writer =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : sessionClient;

    const { data: listing, error: listingError } = await writer
      .from("listings")
      .select("id, user_id, status, year, make, model, trim")
      .eq("id", listing_id)
      .eq("status", "ACTIVE")
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { data: seller, error: sellerError } = await writer
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", listing.user_id)
      .maybeSingle();

    if (sellerError || !seller?.email) {
      return NextResponse.json({ error: "Seller email is not available" }, { status: 500 });
    }

    const { error } = await writer.from("listing_inquiries").insert({
      listing_id,
      seller_id: listing.user_id,
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone || null,
      message,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fordshelbyforsale.com";
    const listingUrl = new URL(`/listings/${listing_id}`, siteUrl).toString();
    const sellerName =
      [seller.first_name, seller.last_name].filter(Boolean).join(" ").trim() ||
      "Seller";
    const vehicleLabel = vehicleLabelFor(listing);

    await subscribeKlaviyoEmail({
      email: seller.email,
      firstName: seller.first_name || undefined,
      lastName: seller.last_name || undefined,
      source: "seller_inquiry_recipient",
      properties: {
        receives_listing_inquiries: true,
        seller_activity: true,
        listing_id,
        vehicle: vehicleLabel,
      },
    });

    const notificationResult = await trackKlaviyoEvent({
      metricName: "Contact seller",
      profile: {
        email: seller.email,
        first_name: seller.first_name || undefined,
        last_name: seller.last_name || undefined,
        external_id: listing.user_id,
        properties: {
          receives_listing_inquiries: true,
        },
      },
      properties: {
        listing_id,
        listing_url: listingUrl,
        vehicle_name: vehicleLabel,
        seller_name: sellerName,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone || null,
        message,
        recipient_type: "seller",
        event_type: "seller_inquiry_received",
        source: "listing_contact_form",
      },
    });

    if (!notificationResult.ok) {
      console.error("Klaviyo seller inquiry notification failed:", {
        listing_id,
        seller_id: listing.user_id,
        result: notificationResult,
      });
    }

    await trackKlaviyoEvent({
      metricName: "Buyer contacted seller",
      profile: {
        email,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || undefined,
      },
      properties: {
        listing_id,
        listing_url: listingUrl,
        vehicle_name: vehicleLabel,
        high_intent: true,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone || null,
        message,
        recipient_type: "buyer",
        event_type: "buyer_contact_submitted",
        source: "listing_contact_form",
      },
    });

    await subscribeKlaviyoEmail({
      email,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
      source: "high_intent_contact",
      properties: {
        listing_id,
        high_intent: true,
        vehicle: vehicleLabel,
      },
    });

    return NextResponse.json({
      ok: true,
      provider: "klaviyo",
      notificationSent: notificationResult.ok,
      emailSent: notificationResult.ok,
      notificationDeliveryError: notificationResult.ok ? null : notificationResult,
      emailDeliveryError: notificationResult.ok ? null : notificationResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send inquiry" }, { status: 500 });
  }
}
