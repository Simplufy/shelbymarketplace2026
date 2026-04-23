import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import Stripe from "stripe";

async function getMonthlyRevenueCents(): Promise<number | null> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // Only report live revenue when a live Stripe key exists.
  if (!stripeSecretKey || !stripeSecretKey.startsWith("sk_live_")) {
    return null;
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let total = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const page = await stripe.paymentIntents.list({
      created: { gte: Math.floor(monthStart.getTime() / 1000) },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const paymentIntent of page.data) {
      if (paymentIntent.status === "succeeded") {
        total += paymentIntent.amount_received || paymentIntent.amount || 0;
      }
    }

    hasMore = page.has_more;
    startingAfter = page.data.length > 0 ? page.data[page.data.length - 1].id : undefined;
  }

  return total;
}

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

    const [{ count: totalListingsCount }, { count: totalUsersCount }, monthlyRevenueCents] = await Promise.all([
      supabase.from("listings").select("id", { head: true, count: "exact" }),
      supabase.from("profiles").select("id", { head: true, count: "exact" }),
      getMonthlyRevenueCents().catch(() => null),
    ]);

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
      total: totalListingsCount || 0,
      pending: hydrated.filter((l) => l.status === "PENDING").length,
      active: hydrated.filter((l) => l.status === "ACTIVE").length,
      featured: hydrated.filter((l) => l.is_featured).length,
      userAccounts: totalUsersCount || 0,
      revenueMonthlyCents: monthlyRevenueCents,
    };

    return NextResponse.json({ data: hydrated, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
