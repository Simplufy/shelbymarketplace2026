import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, user_id, year, make, model, trim, price, status, is_featured, created_at, location, package_tier")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const listingIds = (listings || []).map((l) => l.id);
    let imageByListing = new Map<string, string>();

    if (listingIds.length > 0) {
      const { data: images } = await supabase
        .from("listing_images")
        .select("listing_id, url")
        .eq("is_primary", true)
        .in("listing_id", listingIds);

      imageByListing = new Map((images || []).map((img) => [img.listing_id, img.url]));
    }

    const hydrated = (listings || []).map((listing) => ({
      ...listing,
      seller_name: "Private Seller",
      seller_type: "private",
      dealership_name: null,
      primary_image_url: imageByListing.get(listing.id) || null,
    }));

    const stats = {
      total: hydrated.length,
      pending: hydrated.filter((l) => l.status === "PENDING").length,
      active: hydrated.filter((l) => l.status === "ACTIVE").length,
      featured: hydrated.filter((l) => l.is_featured).length,
    };

    return NextResponse.json({ data: hydrated, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
