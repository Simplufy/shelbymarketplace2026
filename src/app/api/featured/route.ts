import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  // Fetch featured listings with their primary image
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_featured", true)
    .limit(4);
  
  if (error || !listings) {
    return NextResponse.json({ data: [], error: error?.message });
  }
  
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  
  if (activeListings.length === 0) {
    return NextResponse.json({ data: [], error: null });
  }
  
  // Get primary images for each listing
  const listingIds = activeListings.map(l => l.id);
  const { data: images } = await supabase
    .from("listing_images")
    .select("listing_id, url")
    .eq("is_primary", true)
    .in("listing_id", listingIds);
  
  const imageByListingId = new Map((images || []).map(img => [img.listing_id, img.url]));
  
  // Add primary_image_url to each listing
  const listingsWithImages = activeListings.map(listing => ({
    ...listing,
    primary_image_url: imageByListingId.get(listing.id) || null
  }));
  
  return NextResponse.json({ data: listingsWithImages, error: null });
}