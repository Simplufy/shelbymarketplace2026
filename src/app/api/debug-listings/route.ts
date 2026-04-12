import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  
  return NextResponse.json({ data, error: error?.message });
}