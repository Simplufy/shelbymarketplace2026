"use client";

import { Scale, Check } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

interface CompareButtonProps {
  listing: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    price: number;
    mileage: number;
    transmission: string;
    drivetrain: string;
    engine?: string | null;
    exterior_color?: string | null;
    interior_color?: string | null;
    location: string | null;
    primary_image_url: string | null;
    is_featured: boolean;
    dealership_name: string | null;
  };
}

export function CompareButton({ listing }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, maxItems, comparedItems } = useCompare();
  const isAdded = isInCompare(listing.id);
  const isFull = comparedItems.length >= maxItems && !isAdded;

  const handleClick = () => {
    if (isAdded) {
      removeFromCompare(listing.id);
    } else {
      const success = addToCompare(listing);
      if (!success) {
        alert(`You can compare up to ${maxItems} listings at a time`);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFull}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
        isAdded
          ? "bg-[#002D72] text-white"
          : isFull
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Scale className="w-4 h-4" />
          <span>Compare</span>
        </>
      )}
    </button>
  );
}
