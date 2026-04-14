import { NextRequest, NextResponse } from "next/server";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, source, properties } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const subscribeResult = await subscribeKlaviyoEmail({
      email,
      firstName,
      lastName,
      source: source || "website",
      properties,
    });
    
    console.log('Subscribe result:', subscribeResult);

    // Don't track event if subscribe failed
    if (subscribeResult.ok) {
      await trackKlaviyoEvent({
        metricName: "User signup",
        profile: { email, first_name: firstName, last_name: lastName },
        properties: {
          source: source || "website",
          ...(properties || {}),
        },
      });
    }

    if (!subscribeResult.ok) {
      return NextResponse.json({ ok: false, result: subscribeResult }, { status: 502 });
    }

    return NextResponse.json({ ok: true, result: subscribeResult });
  } catch (error: unknown) {
    console.error("Klaviyo subscribe API error:", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
