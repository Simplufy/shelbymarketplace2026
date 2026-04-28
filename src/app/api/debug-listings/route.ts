import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = auth.supabase;
  
  const { data, error } = await supabase
    .from("active_listings")
    .select("id, year, make, model, trim, price, mileage, transmission, drivetrain, location, status, is_featured, primary_image_url, dealership_name, vin")
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
