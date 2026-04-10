"use client";

import { X, Scale, ChevronRight } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import Link from "next/link";

export function CompareBar() {
  const { comparedItems, removeFromCompare, clearCompare } = useCompare();

  if (comparedItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#002D72] rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Compare Listings</p>
                <p className="text-xs text-gray-500">
                  {comparedItems.length} of 3 selected
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 ml-4">
              {comparedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
                >
                  <img
                    src={item.primary_image_url || "/images/logo.png"}
                    alt=""
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="text-xs">
                    <p className="font-medium truncate max-w-[100px]">
                      {item.year} {item.make}
                    </p>
                    <p className="text-gray-500">${(item.price / 1000).toFixed(0)}k</p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(item.id)}
                    className="ml-2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear All
            </button>
            <Link
              href="/compare"
              className="px-6 py-2.5 bg-[#002D72] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#001D4A] transition-colors"
            >
              Compare
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
