import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeKlaviyoEmail } from "@/lib/klaviyo/server";
import { sendSellerInquiryEmail } from "@/lib/email/seller-inquiry";

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

    const emailResult = await sendSellerInquiryEmail({
      to: seller.email,
      sellerName,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone || null,
      message,
      vehicleLabel,
      listingUrl,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.error }, { status: 502 });
    }

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

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send inquiry" }, { status: 500 });
  }
}
