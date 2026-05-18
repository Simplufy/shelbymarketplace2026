import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { normalizeCarfaxReportUrl } from "@/lib/listings/carfax";
import { syncListingCarfaxFeature } from "@/lib/listings/carfax-server";

const MAX_LISTING_IMAGES = 35;
const VALID_TRANSMISSIONS = new Set(["Manual", "Automatic"]);
const VALID_DRIVETRAINS = new Set(["RWD", "AWD", "4WD"]);
const VALID_STATUSES = new Set(["PENDING", "ACTIVE", "SOLD", "REJECTED"]);
const VALID_PACKAGES = new Set(["STANDARD", "HOMEPAGE", "HOMEPAGE_PLUS_ADS"]);
const OPTIONAL_LISTING_COLUMNS = [
  "msrp",
  "listing_tags",
  "service_history",
  "carfax_report_url",
  "video_url",
] as const;

type ListingImageInput = {
  url?: string;
  storagePath?: string;
};

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

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function nullableString(value: unknown) {
  const next = stringValue(value);
  return next || null;
}

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return Number.NaN;
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
  const unsupportedColumns = OPTIONAL_LISTING_COLUMNS.filter((column) => text.includes(column));

  for (const column of unsupportedColumns) {
    if (Object.prototype.hasOwnProperty.call(next, column)) {
      delete next[column];
    }
  }

  return next;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin listing reads are not configured" }, { status: 500 });
    }

    const { data: listings, error } = await admin
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const listingIds = listings.map((listing: any) => listing.id);
    const userIds = [...new Set(listings.map((listing: any) => listing.user_id).filter(Boolean))];

    const [{ data: primaryImages }, { data: profiles }, { data: dealers }] = await Promise.all([
      admin
        .from("listing_images")
        .select("listing_id, url")
        .eq("is_primary", true)
        .in("listing_id", listingIds),
      userIds.length
        ? admin
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", userIds)
        : Promise.resolve({ data: [] }),
      userIds.length
        ? admin
            .from("dealer_profiles")
            .select("user_id, dealership_name")
            .in("user_id", userIds)
        : Promise.resolve({ data: [] }),
    ]);

    const imageByListing = new Map((primaryImages || []).map((image: any) => [image.listing_id, image.url]));
    const profileByUser = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
    const dealerByUser = new Map((dealers || []).map((dealer: any) => [dealer.user_id, dealer]));

    const data = listings.map((listing: any) => {
      const dealer = dealerByUser.get(listing.user_id);
      const profile = profileByUser.get(listing.user_id);
      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();

      return {
        ...listing,
        seller_name: dealer?.dealership_name || fullName || "Private Seller",
        seller_email: profile?.email || undefined,
        seller_type: dealer ? "dealer" : "private",
        dealership_name: dealer?.dealership_name || null,
        primary_image_url: imageByListing.get(listing.id) || null,
      };
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const sellerUserId = stringValue(body?.seller_user_id);
    const listingInput = body?.listing && typeof body.listing === "object" ? body.listing : {};
    const images = Array.isArray(body?.images) ? (body.images as ListingImageInput[]) : [];
    const primaryImageIndex = Number.isInteger(body?.primaryImageIndex) ? body.primaryImageIndex : 0;

    if (!sellerUserId) {
      return NextResponse.json({ error: "Listing owner is required" }, { status: 400 });
    }

    if (images.length > MAX_LISTING_IMAGES) {
      return NextResponse.json({ error: `Listings can have up to ${MAX_LISTING_IMAGES} images` }, { status: 400 });
    }

    const invalidImage = images.find((image) => !image.url || !image.storagePath);
    if (invalidImage) {
      return NextResponse.json({ error: "Every image needs a URL and storage path" }, { status: 400 });
    }

    const year = numberValue((listingInput as Record<string, unknown>).year);
    const price = numberValue((listingInput as Record<string, unknown>).price);
    const mileage = numberValue((listingInput as Record<string, unknown>).mileage);
    const transmission = stringValue((listingInput as Record<string, unknown>).transmission, "Manual");
    const drivetrain = stringValue((listingInput as Record<string, unknown>).drivetrain, "RWD");
    const status = stringValue((listingInput as Record<string, unknown>).status, "ACTIVE").toUpperCase();
    const packageTier = stringValue((listingInput as Record<string, unknown>).package_tier, "STANDARD").toUpperCase();

    const requiredFields = [
      ["VIN", stringValue((listingInput as Record<string, unknown>).vin)],
      ["make", stringValue((listingInput as Record<string, unknown>).make)],
      ["model", stringValue((listingInput as Record<string, unknown>).model)],
      ["location", stringValue((listingInput as Record<string, unknown>).location)],
      ["description", stringValue((listingInput as Record<string, unknown>).description)],
    ];
    const missingField = requiredFields.find(([, value]) => !value);
    if (missingField) {
      return NextResponse.json({ error: `${missingField[0]} is required` }, { status: 400 });
    }

    if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 2) {
      return NextResponse.json({ error: "A valid year is required" }, { status: 400 });
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }

    if (!Number.isFinite(mileage) || mileage < 0) {
      return NextResponse.json({ error: "A valid mileage is required" }, { status: 400 });
    }

    if (!VALID_TRANSMISSIONS.has(transmission)) {
      return NextResponse.json({ error: "Invalid transmission" }, { status: 400 });
    }

    if (!VALID_DRIVETRAINS.has(drivetrain)) {
      return NextResponse.json({ error: "Invalid drivetrain" }, { status: 400 });
    }

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid listing status" }, { status: 400 });
    }

    if (!VALID_PACKAGES.has(packageTier)) {
      return NextResponse.json({ error: "Invalid package tier" }, { status: 400 });
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: "Admin listing creation is not configured" }, { status: 500 });
    }

    const { data: sellerProfile, error: sellerError } = await admin
      .from("profiles")
      .select("id,email")
      .eq("id", sellerUserId)
      .maybeSingle();

    if (sellerError) {
      return NextResponse.json({ error: sellerError.message }, { status: 500 });
    }

    if (!sellerProfile) {
      return NextResponse.json({ error: "Selected listing owner was not found" }, { status: 404 });
    }

    const rawListing = listingInput as Record<string, unknown>;
    const carfaxReportUrl = normalizeCarfaxReportUrl(rawListing.carfax_report_url);
    const insertPayload: Record<string, unknown> = {
      user_id: sellerUserId,
      vin: stringValue(rawListing.vin),
      year,
      make: stringValue(rawListing.make),
      model: stringValue(rawListing.model),
      trim: nullableString(rawListing.trim),
      price,
      msrp: price,
      mileage,
      transmission,
      drivetrain,
      exterior_color: nullableString(rawListing.exterior_color),
      interior_color: nullableString(rawListing.interior_color),
      location: stringValue(rawListing.location),
      description: stringValue(rawListing.description),
      package_tier: packageTier,
      status,
      is_featured: Boolean(rawListing.is_featured),
      engine: nullableString(rawListing.engine),
      carfax_report_url: carfaxReportUrl,
      video_url: nullableString(rawListing.video_url),
      listing_tags: Array.isArray(rawListing.listing_tags) && rawListing.listing_tags.length > 0 ? rawListing.listing_tags : null,
      service_history: Array.isArray(rawListing.service_history) ? rawListing.service_history : [],
    };

    let listing: any = null;
    let listingError: any = null;
    let insertAttempt = insertPayload;

    for (let attempt = 0; attempt <= OPTIONAL_LISTING_COLUMNS.length; attempt++) {
      ({ data: listing, error: listingError } = await admin
        .from("listings")
        .insert(insertAttempt)
        .select()
        .single());

      if (!listingError) break;

      const sanitized = stripUnsupportedListingColumns(insertAttempt, listingError);
      if (JSON.stringify(sanitized) === JSON.stringify(insertAttempt)) break;

      console.warn("Retrying admin listing create without unsupported columns", {
        removed: Object.keys(insertAttempt).filter((key) => !(key in sanitized)),
        error: listingError.message,
      });
      insertAttempt = sanitized as typeof insertPayload;
    }

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }

    await syncListingCarfaxFeature(admin, listing.id, carfaxReportUrl);

    if (images.length > 0) {
      const safePrimaryIndex =
        primaryImageIndex >= 0 && primaryImageIndex < images.length ? primaryImageIndex : 0;

      const imageRecords = images.map((image, index) => ({
        listing_id: listing.id,
        url: image.url,
        storage_path: image.storagePath,
        is_primary: index === safePrimaryIndex,
        order_index: index,
      }));

      const { error: imageError } = await admin.from("listing_images").insert(imageRecords);
      if (imageError) {
        return NextResponse.json({ error: imageError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ data: listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create listing" }, { status: 500 });
  }
}
