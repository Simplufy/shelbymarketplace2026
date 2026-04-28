import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = auth.supabase;
  
  const { data, error } = await supabase
    .from("listings")
    .select("id")
    .limit(1);
  
  return NextResponse.json({ 
    success: !error, 
    data, 
    error: error?.message,
  });
}
