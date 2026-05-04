import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const MAX_LISTING_IMAGES = 35;

type ListingImageInput = {
  url?: string;
  storagePath?: string;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await req.json();
    const images = Array.isArray(body?.images) ? (body.images as ListingImageInput[]) : [];
    const primaryImageIndex = Number.isInteger(body?.primaryImageIndex) ? body.primaryImageIndex : 0;

    if (!id) {
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }

    if (images.length > MAX_LISTING_IMAGES) {
      return NextResponse.json({ error: `Listings can have up to ${MAX_LISTING_IMAGES} images` }, { status: 400 });
    }

    const invalidImage = images.find((image) => !image.url || !image.storagePath);
    if (invalidImage) {
      return NextResponse.json({ error: "Every image needs a URL and storage path" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Admin image updates are not configured" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteError } = await admin
      .from("listing_images")
      .delete()
      .eq("listing_id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (images.length > 0) {
      const safePrimaryIndex =
        primaryImageIndex >= 0 && primaryImageIndex < images.length ? primaryImageIndex : 0;

      const records = images.map((image, index) => ({
        listing_id: id,
        url: image.url,
        storage_path: image.storagePath,
        is_primary: index === safePrimaryIndex,
        order_index: index,
      }));

      const { error: insertError } = await admin.from("listing_images").insert(records);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update listing images" }, { status: 500 });
  }
}
