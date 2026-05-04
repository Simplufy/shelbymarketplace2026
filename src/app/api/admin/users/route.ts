import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceKey) return null;

  return createAdminClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin user reads are not configured" }, { status: 500 });
    }

    const [{ data: profiles, error: profilesError }, { data: listings, error: listingsError }] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      admin.from("listings").select("user_id, id"),
    ]);

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    if (listingsError) {
      return NextResponse.json({ error: listingsError.message }, { status: 500 });
    }

    const listingCounts: Record<string, number> = {};
    (listings || []).forEach((listing: any) => {
      listingCounts[listing.user_id] = (listingCounts[listing.user_id] || 0) + 1;
    });

    const data = (profiles || []).map((profile: any) => ({
      ...profile,
      listings_count: listingCounts[profile.id] || 0,
      status: "active",
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}
