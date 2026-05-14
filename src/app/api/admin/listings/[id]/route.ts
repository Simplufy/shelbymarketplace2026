import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const RELATED_LISTING_TABLES = [
  "listing_images",
  "listing_features",
  "saved_listings",
  "listing_inquiries",
  "listing_page_views",
];
const OPTIONAL_LISTING_COLUMNS = [
  "msrp",
  "listing_tags",
  "service_history",
  "carfax_report_url",
  "video_url",
] as const;

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

function isMissingRelationError(error: any) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    String(error?.message || "").toLowerCase().includes("does not exist")
  );
}

function errorText(error: any) {
  return [error?.code, error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function stripUnsupportedListingColumns(payload: Record<string, unknown>, error: any) {
  const text = errorText(error);
  if (!text) return payload;

  const next = { ...payload };
  const isSchemaCacheError = text.includes("schema cache") || text.includes("pgrst204");

  for (const column of OPTIONAL_LISTING_COLUMNS) {
    if (text.includes(column) || (isSchemaCacheError && Object.prototype.hasOwnProperty.call(next, column))) {
      delete next[column];
    }
  }

  return next;
}

async function deleteRelatedRows(admin: NonNullable<ReturnType<typeof createServiceRoleClient>>, listingId: string) {
  for (const table of RELATED_LISTING_TABLES) {
    const { error } = await admin
      .from(table)
      .delete()
      .eq("listing_id", listingId);

    if (error && !isMissingRelationError(error)) {
      throw new Error(error.message);
    }
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin listing reads are not configured" }, { status: 500 });
    }

    const { data: listing, error: listingError } = await admin
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const [{ data: images }, { data: features }, { data: profile }] = await Promise.all([
      admin
        .from("listing_images")
        .select("*")
        .eq("listing_id", id)
        .order("order_index", { ascending: true }),
      admin.from("listing_features").select("feature").eq("listing_id", id),
      admin.from("profiles").select("*").eq("id", listing.user_id).maybeSingle(),
    ]);

    let dealershipName: string | null = null;
    if (profile?.role === "DEALER") {
      const { data: dealer } = await admin
        .from("dealer_profiles")
        .select("dealership_name")
        .eq("user_id", listing.user_id)
        .maybeSingle();
      dealershipName = dealer?.dealership_name || null;
    }

    return NextResponse.json({
      data: {
        listing,
        images: images || [],
        features: (features || []).map((feature: any) => feature.feature),
        seller: {
          name:
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
            dealershipName ||
            "Unknown",
          email: profile?.email || "",
          phone: profile?.phone || null,
          role: profile?.role || "BUYER",
          dealership_name: dealershipName,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load listing" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }

    const body = await req.json();
    const listingInput = body?.listing && typeof body.listing === "object" ? body.listing : body;
    const forbiddenColumns = new Set(["id", "user_id", "created_at"]);
    const updatePayload: Record<string, unknown> = Object.fromEntries(
      Object.entries(listingInput || {}).filter(([key]) => !forbiddenColumns.has(key))
    );

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No listing updates provided" }, { status: 400 });
    }

    updatePayload.updated_at = new Date().toISOString();

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin listing updates are not configured" }, { status: 500 });
    }

    let data: any = null;
    let error: any = null;
    let updateAttempt = updatePayload;

    for (let attempt = 0; attempt <= OPTIONAL_LISTING_COLUMNS.length; attempt++) {
      ({ data, error } = await admin
        .from("listings")
        .update(updateAttempt)
        .eq("id", id)
        .select()
        .maybeSingle());

      if (!error) break;

      const sanitized = stripUnsupportedListingColumns(updateAttempt, error);
      if (JSON.stringify(sanitized) === JSON.stringify(updateAttempt)) break;

      console.warn("Retrying admin listing update without unsupported columns", {
        listing_id: id,
        removed: Object.keys(updateAttempt).filter((key) => !(key in sanitized)),
        error: error.message,
      });
      updateAttempt = sanitized;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update listing" }, { status: 500 });
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
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin listing deletion is not configured" }, { status: 500 });
    }

    await deleteRelatedRows(admin, id);

    const { data, error } = await admin
      .from("listings")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete listing" }, { status: 500 });
  }
}
