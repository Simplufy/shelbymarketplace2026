import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("section", "homepage")
    .eq("key", "hero")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  
  const heroContent = data?.value as any;
  return NextResponse.json({ 
    searchPlaceholder: heroContent?.searchPlaceholder || "Search by Model, Year, or ZIP..." 
  });
}