"use client";

import { Phone, Mail } from "lucide-react";

export default function StickyContactBar({ isAuthenticated, seller }: { isAuthenticated: boolean, seller: any }) {
  if (!isAuthenticated) return null; // Could show login button instead, but keeping clean

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 md:hidden flex gap-3">
      <a href={`tel:${seller.phone.replace(/[^0-9]/g, '')}`} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
        <Phone className="w-5 h-5" /> Call Now
      </a>
      <a href={`mailto:${seller.email}`} className="flex-[2] flex items-center justify-center gap-2 bg-[var(--color-shelby-blue)] text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#001D40] active:scale-95 transition-all">
        <Mail className="w-5 h-5" /> Contact Seller
      </a>
    </div>
  );
}
