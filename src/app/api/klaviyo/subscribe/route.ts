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

    await trackKlaviyoEvent({
      metricName: "User Signup",
      profile: { email, first_name: firstName, last_name: lastName },
      properties: {
        source: source || "website",
        ...(properties || {}),
      },
    });

    return NextResponse.json({ ok: true, result: subscribeResult });
  } catch (error: any) {
    console.error("Klaviyo subscribe API error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
