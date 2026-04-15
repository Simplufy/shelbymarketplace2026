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
  
  return NextResponse.json({ data: content, error: error?.message });
}
