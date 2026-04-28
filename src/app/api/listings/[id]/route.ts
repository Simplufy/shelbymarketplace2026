import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function minWeeklyViewsForListing(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return 22 + (Math.abs(hash) % 6); // 22-27
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }

    const sessionClient = await createServerClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    const reader =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : sessionClient;

    const { data: listingData, error: listingError } = await reader
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("status", "ACTIVE")
      .single();

    if (listingError || !listingData) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const [{ data: imagesData }, { data: featuresData }, { data: profileData }] = await Promise.all([
      reader
        .from("listing_images")
        .select("url, is_primary")
        .eq("listing_id", id)
        .order("order_index", { ascending: true }),
      reader.from("listing_features").select("feature").eq("listing_id", id),
      reader.from("profiles").select("*").eq("id", listingData.user_id).single(),
    ]);

    await reader.from("listing_page_views").insert({ listing_id: id });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weeklyViewCount } = await reader
      .from("listing_page_views")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", id)
      .gte("viewed_at", weekAgo.toISOString());

    let dealershipName: string | null = null;
    if (profileData?.role === "DEALER") {
      const { data: dealerData } = await reader
        .from("dealer_profiles")
        .select("dealership_name")
        .eq("user_id", listingData.user_id)
        .single();
      dealershipName = dealerData?.dealership_name || null;
    }

    const publicListingData = Object.fromEntries(
      Object.entries(listingData).filter(([key]) => key !== "user_id")
    );

    const formattedData = {
      ...publicListingData,
      seller_name: `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim() || "Private Seller",
      seller_email: user ? profileData?.email || "" : "",
      seller_phone: user ? profileData?.phone || null : null,
      seller_avatar: profileData?.avatar_url || null,
      seller_type: profileData?.role === "DEALER" ? "Dealer" : "Private Seller",
      seller_verified: listingData.status === "ACTIVE",
      weekly_views: Math.max(weeklyViewCount || 0, minWeeklyViewsForListing(id)),
      dealership_name: dealershipName,
      images: imagesData || [],
      features: (featuresData || []).map((f: any) => f.feature),
    };

    return NextResponse.json({ data: formattedData }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load listing" }, { status: 500 });
  }
}
