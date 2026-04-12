import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_featured", true)
    .limit(4);
  
  const featured = (data || []).filter(l => l.status === 'ACTIVE');
  
  return NextResponse.json({ data: featured, error: error?.message });
}