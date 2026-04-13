import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", "homepage")
    .order("updated_at", { ascending: false })
    .in("key", ["hero", "featured_listings", "why_sell", "cta"]);
  
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