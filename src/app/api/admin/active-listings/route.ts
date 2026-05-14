import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    let { data: listings, error } = await supabase
      .from("listings")
      .select("id, year, make, model, price, msrp")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      const missingMsrp = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes("msrp");

      if (!missingMsrp) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const fallback = await supabase
        .from("listings")
        .select("id, year, make, model, price")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(20);

      listings = (fallback.data || []).map((listing: any) => ({ ...listing, msrp: null }));
      error = fallback.error;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const ids = (listings || []).map((l) => l.id);
    let imageByListing = new Map<string, string>();

    if (ids.length > 0) {
      const { data: images } = await supabase
        .from("listing_images")
        .select("listing_id, url")
        .eq("is_primary", true)
        .in("listing_id", ids);
      imageByListing = new Map((images || []).map((img) => [img.listing_id, img.url]));
    }

    const data = (listings || []).map((l) => ({
      id: l.id,
      title: `${l.year} ${l.make} ${l.model}`,
      price: l.price,
      msrp: l.msrp,
      image: imageByListing.get(l.id) || "/images/logo.png",
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
