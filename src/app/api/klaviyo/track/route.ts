import { NextRequest, NextResponse } from "next/server";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

const EVENT_ALIASES: Record<string, string> = {
  "Viewed Listing": "Viewed listing",
  "Contact Seller Click": "Contact seller",
  "Contact seller click": "Contact seller",
  "Listing approved/published": "Listing approved",
  "Listing Approved/Published": "Listing approved",
};

function normalizeProperties(properties: Record<string, unknown> = {}) {
  return {
    vehicle_name: properties.vehicle_name ?? properties.vehicleName ?? null,
    price: properties.price ?? properties.new_price ?? null,
    image: properties.image ?? properties.image_url ?? null,
    url: properties.url ?? null,
    location: properties.location ?? null,
    ...properties,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, profile, properties } = body;

    if (!event) {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const canonicalEvent = EVENT_ALIASES[event] || event;
    const normalizedProperties = normalizeProperties(properties || {});

    const result = await trackKlaviyoEvent({
      metricName: canonicalEvent,
      profile: profile || {},
      properties: normalizedProperties,
    });

    const email = profile?.email as string | undefined;
    if (email) {
      if (canonicalEvent === "Viewed listing") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: "listing_view",
          properties: {
            buyer_intent: true,
            ...normalizedProperties,
          },
        });
      }

      if (canonicalEvent === "Contact seller") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: "high_intent_contact",
          properties: {
            high_intent: true,
            ...normalizedProperties,
          },
        });
      }

      if (canonicalEvent === "New listing created" || canonicalEvent === "Listing approved") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: canonicalEvent === "New listing created" ? "seller_listing_submit" : "listing_published",
          properties: {
            seller_activity: true,
            ...normalizedProperties,
          },
        });
      }
    }

    if (!result.ok) {
      return NextResponse.json({ ok: false, result }, { status: 502 });
    }

    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    console.error("Klaviyo track API error:", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
