import { NextRequest, NextResponse } from "next/server";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, profile, properties } = body;

    if (!event) {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const result = await trackKlaviyoEvent({
      metricName: event,
      profile: profile || {},
      properties: properties || {},
    });

    const email = profile?.email as string | undefined;
    if (email) {
      if (event === "Viewed Listing") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: "listing_view",
          properties: {
            buyer_intent: true,
            ...(properties || {}),
          },
        });
      }

      if (event === "Contact Seller Click") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: "high_intent_contact",
          properties: {
            high_intent: true,
            ...(properties || {}),
          },
        });
      }

      if (event === "New Listing Created" || event === "Listing Approved/Published") {
        await subscribeKlaviyoEmail({
          email,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          source: event === "New Listing Created" ? "seller_listing_submit" : "listing_published",
          properties: {
            seller_activity: true,
            ...(properties || {}),
          },
        });
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    console.error("Klaviyo track API error:", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
