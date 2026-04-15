import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

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
    const { listing_id, seller_id, name, email, phone, message } = body;

    if (!listing_id || !seller_id || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionClient = await createServerClient();
    await sessionClient.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    const writer =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : sessionClient;

    const { error } = await writer.from("listing_inquiries").insert({
      listing_id,
      seller_id,
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

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send inquiry" }, { status: 500 });
  }
}
