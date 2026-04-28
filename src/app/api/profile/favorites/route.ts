import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: [] });
    }

    const { data: savedRows, error: savedError } = await supabase
      .from("saved_listings")
      .select("listing_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (savedError) {
      return NextResponse.json({ error: savedError.message }, { status: 500 });
    }

    const listingIds = (savedRows || []).map((row: any) => row.listing_id);
    if (listingIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    const reader =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase;

    const { data: listings, error: listingError } = await reader
      .from("listings")
      .select("*")
      .in("id", listingIds);

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    const { data: images } = await reader
      .from("listing_images")
      .select("*")
      .in("listing_id", listingIds)
      .order("order_index", { ascending: true });

    const sellerIds = [...new Set((listings || []).map((l: any) => l.user_id).filter(Boolean))];
    let profileByUser = new Map<string, any>();

    if (sellerIds.length > 0) {
      const { data: profiles } = await reader
        .from("profiles")
        .select("*")
        .in("id", sellerIds);
      profileByUser = new Map((profiles || []).map((p: any) => [p.id, p]));
    }

    const imagesByListing = new Map<string, any[]>();
    (images || []).forEach((img: any) => {
      const arr = imagesByListing.get(img.listing_id) || [];
      arr.push(img);
      imagesByListing.set(img.listing_id, arr);
    });

    const listingById = new Map((listings || []).map((l: any) => [l.id, l]));

    const hydrated = listingIds
      .map((id: string) => {
        const listing = listingById.get(id);
        if (!listing) return null;
        return {
          ...listing,
          images: imagesByListing.get(id) || [],
          profile: profileByUser.get(listing.user_id) || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ data: hydrated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
