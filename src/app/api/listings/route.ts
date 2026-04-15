import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
    const requestedPageSize = Number(req.nextUrl.searchParams.get("pageSize") || "24");
    const pageSize = Math.min(Math.max(1, requestedPageSize), 1000);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createClient();
    const { data, error, count } = await supabase
      .from("active_listings")
      .select("id, year, make, model, trim, price, mileage, transmission, drivetrain, location, status, is_featured, primary_image_url, dealership_name, vin", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json(
      {
        data: data || [],
        pagination: { page, pageSize, total, totalPages },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load listings" }, { status: 500 });
  }
}
