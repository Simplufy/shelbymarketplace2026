import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const RELATED_LISTING_TABLES = [
  "listing_images",
  "listing_features",
  "saved_listings",
  "listing_inquiries",
  "listing_page_views",
];

function isMissingRelationError(error: any) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    String(error?.message || "").toLowerCase().includes("does not exist")
  );
}

async function safeDelete(query: PromiseLike<{ error: any }>) {
  const { error } = await query;
  if (error && !isMissingRelationError(error)) {
    throw new Error(error.message);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    if (id === auth.user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Admin user deletion is not configured" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userListings, error: listingsError } = await admin
      .from("listings")
      .select("id")
      .eq("user_id", id);

    if (listingsError) {
      return NextResponse.json({ error: listingsError.message }, { status: 500 });
    }

    const listingIds = (userListings || []).map((listing: any) => listing.id);

    if (listingIds.length > 0) {
      for (const table of RELATED_LISTING_TABLES) {
        await safeDelete(admin.from(table).delete().in("listing_id", listingIds));
      }

      await safeDelete(admin.from("listings").delete().eq("user_id", id));
    }

    await safeDelete(admin.from("saved_listings").delete().eq("user_id", id));
    await safeDelete(admin.from("dealer_profiles").delete().eq("user_id", id));

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await safeDelete(admin.from("profiles").delete().eq("id", id));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
