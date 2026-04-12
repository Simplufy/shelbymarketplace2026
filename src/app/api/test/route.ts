import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("listings")
    .select("id")
    .limit(1);
  
  return NextResponse.json({ 
    success: !error, 
    data, 
    error: error?.message,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}