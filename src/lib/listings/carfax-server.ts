import { CARFAX_FEATURE_PREFIXES, formatCarfaxFeature } from "./carfax";

type SupabaseClientLike = {
  from: (table: string) => any;
};

function isMissingRelationError(error: any) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    String(error?.message || "").toLowerCase().includes("does not exist")
  );
}

export async function syncListingCarfaxFeature(
  admin: SupabaseClientLike,
  listingId: string,
  url: string | null
) {
  for (const prefix of CARFAX_FEATURE_PREFIXES) {
    const { error } = await admin
      .from("listing_features")
      .delete()
      .eq("listing_id", listingId)
      .like("feature", `${prefix}%`);

    if (error && !isMissingRelationError(error)) {
      throw new Error(error.message);
    }
  }

  if (!url) return;

  const { error } = await admin
    .from("listing_features")
    .insert({ listing_id: listingId, feature: formatCarfaxFeature(url) });

  if (error && !isMissingRelationError(error)) {
    throw new Error(error.message);
  }
}
