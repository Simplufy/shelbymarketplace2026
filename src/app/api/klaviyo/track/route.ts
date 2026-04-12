import { NextRequest, NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo/server";

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

    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    console.error("Klaviyo track API error:", error);
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
