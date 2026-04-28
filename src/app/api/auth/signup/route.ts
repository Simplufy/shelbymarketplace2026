import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeKlaviyoEmail, trackKlaviyoEvent } from "@/lib/klaviyo/server";

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "auth-signup", { windowMs: 60 * 60 * 1000, max: 6 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }

    if (serviceKey) {
      const admin = createSupabaseClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: registrationSetting } = await admin
        .from("site_settings")
        .select("value")
        .eq("key", "enable_registration")
        .single();

      if (registrationSetting && registrationSetting.value === false) {
        return NextResponse.json({ error: "New registrations are currently disabled." }, { status: 403 });
      }
    }

    const authClient = createSupabaseClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user && serviceKey) {
      const admin = createSupabaseClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      await admin.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: "BUYER",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    const signupPayload = {
      role: "BUYER",
      vehicle_name: null,
      price: null,
      image: null,
      url: null,
      location: null,
    } as const;

    let klaviyoOk = false;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const subscribeResult = await subscribeKlaviyoEmail({
        email,
        firstName,
        lastName,
        source: "account_signup",
        properties: signupPayload,
      });

      if (subscribeResult.ok) {
        await trackKlaviyoEvent({
          metricName: "User signup",
          profile: { email, first_name: firstName, last_name: lastName },
          properties: signupPayload,
        });
        klaviyoOk = true;
        break;
      }
    }

    if (!klaviyoOk) {
      console.error("Klaviyo sync failed after retries", { email });
      return NextResponse.json({ ok: true, klaviyoSynced: false });
    }

    return NextResponse.json({ ok: true, klaviyoSynced: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 });
  }
}
