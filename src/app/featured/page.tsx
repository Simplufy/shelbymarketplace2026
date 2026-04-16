"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Gauge, ShieldCheck, Zap } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

type Listing = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number;
  transmission: string;
  location: string | null;
  is_featured: boolean;
  primary_image_url: string | null;
};

export default function FeaturedListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/listings?page=1&pageSize=1000", { cache: "no-store" });
        const payload = await response.json();
        const featured = (payload?.data || []).filter((item: Listing) => item.is_featured);
        setListings(featured);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const sorted = useMemo(() => [...listings].sort((a, b) => b.year - a.year), [listings]);

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[1440px] mx-auto px-4 md:px-12 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-outfit font-black tracking-tight mb-3">Featured Listings</h1>
          <p className="text-[#565d6d] text-lg">Vetted high-performance Shelby vehicles from Dealers and Private Sellers nationwide.</p>
        </div>

        {loading ? (
          <div className="text-[#565d6d]">Loading featured listings...</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-14 bg-[#fafafb] rounded-2xl border border-[#dee1e6]">
            <p className="text-[#565d6d]">No featured listings are available right now.</p>
            <Link href="/listings" className="inline-block mt-3 text-[#002D72] font-bold hover:underline">
              Browse all listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorted.map((car) => (
              <Link key={car.id} href={`/listings/${car.id}`} className="bg-white rounded-xl border border-[#dee1e6] overflow-hidden card-shadow hover:shadow-lg transition-shadow">
                <div className="relative h-56">
                  <img src={car.primary_image_url || "/images/logo.png"} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#E31837] text-white text-[10px] font-bold rounded-full">FEATURED</div>
                  <FavoriteButton listingId={car.id} className="absolute top-3 right-3" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-1 break-words">{car.year} {car.make} {car.model} {car.trim || ""}</h3>
                  <p className="text-2xl font-black text-[#E31837] mb-4">${car.price.toLocaleString()}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-[#565d6d]">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {car.year}</div>
                    <div className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {car.mileage.toLocaleString()} mi</div>
                    <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> {car.transmission}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#002D72] uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> Featured Seller Quality
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
