"use client";

import Link from "next/link";
import { useCompare } from "@/contexts/CompareContext";
import { X, ChevronRight, Scale, Check, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComparePage() {
  const { comparedItems, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  useEffect(() => {
    if (comparedItems.length === 0) {
      router.push("/listings");
    }
  }, [comparedItems, router]);

  if (comparedItems.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return mileage.toLocaleString();
  };

  type CompareField = {
    label: string;
    key: keyof typeof comparedItems[0];
    format?: (v: any) => string;
  };

  const compareFields: CompareField[] = [
    { label: "Year", key: "year" },
    { label: "Make", key: "make" },
    { label: "Model", key: "model" },
    { label: "Trim", key: "trim", format: (v: string | null) => v || "Standard" },
    { label: "Price", key: "price", format: formatPrice },
    { label: "Mileage", key: "mileage", format: (v: number) => `${formatMileage(v)} mi` },
    { label: "Transmission", key: "transmission" },
    { label: "Drivetrain", key: "drivetrain" },
    { label: "Exterior Color", key: "exterior_color", format: (v: string | null) => v || "N/A" },
    { label: "Interior Color", key: "interior_color", format: (v: string | null) => v || "N/A" },
    { label: "Location", key: "location", format: (v: string | null) => v || "Not specified" },
    { label: "Seller", key: "dealership_name", format: (v: string | null) => v || "Private Seller" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafb] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-[#565d6d] mb-4">
            <Link href="/" className="hover:text-[#002D72]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/listings" className="hover:text-[#002D72]">Listings</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#171a1f] font-medium">Compare</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-outfit font-black text-3xl sm:text-4xl tracking-tight mb-2">
                Compare Listings
              </h1>
              <p className="text-[#565d6d]">
                Comparing {comparedItems.length} vehicles side by side
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/listings"
                className="px-4 py-2 border border-[#dee1e6] text-[#565d6d] font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Add More
              </Link>
              <button
                onClick={clearCompare}
                className="px-4 py-2 bg-[#E31837] text-white font-medium rounded-xl hover:bg-[#c41530] transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 overflow-hidden">
          {/* Vehicle Headers */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${comparedItems.length}, 1fr)` }}>
            <div className="p-6 bg-gray-50 border-r border-b border-[#dee1e6] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#002D72]" />
              <span className="font-bold">Vehicles</span>
            </div>
            {comparedItems.map((item) => (
              <div key={item.id} className="p-6 border-r border-b border-[#dee1e6] last:border-r-0 relative">
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={item.primary_image_url || "/images/logo.png"}
                    alt={`${item.year} ${item.make} ${item.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">
                  {item.year} {item.make} {item.model}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{item.trim || "Standard"}</p>
                <p className="text-2xl font-black text-[#E31837] mb-4">
                  {formatPrice(item.price)}
                </p>
                <Link
                  href={`/listings/${item.id}`}
                  className="w-full py-2.5 bg-[#002D72] text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#001D4A] transition-colors"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {compareFields.map((field) => (
            <div
              key={field.key}
              className="grid border-b border-[#dee1e6] last:border-b-0"
              style={{ gridTemplateColumns: `200px repeat(${comparedItems.length}, 1fr)` }}
            >
              <div className="p-4 bg-gray-50 border-r border-[#dee1e6] flex items-center">
                <span className="font-medium text-sm text-gray-600">{field.label}</span>
              </div>
              {comparedItems.map((item) => {
                const value = item[field.key];
                const displayValue = field.format ? field.format(value) : String(value);
                
                // Highlight best value for price (lowest) and mileage (lowest)
                let isBest = false;
                if (field.key === "price" || field.key === "mileage") {
                  const values = comparedItems.map((i) => Number(i[field.key]));
                  const minValue = Math.min(...values);
                  isBest = Number(value) === minValue;
                }

                return (
                  <div
                    key={item.id}
                    className={`p-4 border-r border-[#dee1e6] last:border-r-0 flex items-center ${
                      isBest ? "bg-green-50" : ""
                    }`}
                  >
                    <span className={`font-medium ${isBest ? "text-green-700" : ""}`}>
                      {displayValue}
                    </span>
                    {isBest && (
                      <Check className="w-4 h-4 text-green-600 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Best value (lowest price/mileage)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
