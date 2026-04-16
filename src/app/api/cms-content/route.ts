import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  const reader =
    supabaseUrl && serviceKey
      ? createAdminClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;
  
  const { data, error } = await reader
    .from("site_content")
    .select("key, value")
    .eq("section", "homepage")
    .order("updated_at", { ascending: false })
    .in("key", ["hero", "featured_listings", "why_sell", "why_buy", "cta"]);
  
  // Get most recent value for each key
  const content: Record<string, any> = {};
  if (data) {
    for (const row of data) {
      if (!content[row.key]) {
        content[row.key] = row.value;
      }
    }
  }

  if (Object.keys(content).length === 0) {
    const { data: mirroredRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "homepage_hero",
        "homepage_featured_listings",
        "homepage_why_sell",
        "homepage_why_buy",
        "homepage_cta",
      ]);

    for (const row of mirroredRows || []) {
      if (row.key === "homepage_hero") content.hero = row.value;
      if (row.key === "homepage_featured_listings") content.featured_listings = row.value;
      if (row.key === "homepage_why_sell") content.why_sell = row.value;
      if (row.key === "homepage_why_buy") content.why_buy = row.value;
      if (row.key === "homepage_cta") content.cta = row.value;
    }
  }
  
  return NextResponse.json({ data: content, error: error?.message });
}
