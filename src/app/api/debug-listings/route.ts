import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
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
