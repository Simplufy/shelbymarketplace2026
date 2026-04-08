"use client";

import { Mail, Phone, Lock, User } from "lucide-react";
import Link from "next/link";

export default function VDPSellerCard({ isAuthenticated, seller }: { isAuthenticated: boolean, seller: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
      <h3 className="font-heading font-bold text-xl text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">Seller Information</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900">{seller.name}</h4>
          <p className="text-sm text-gray-500 font-medium">Member since {seller.joinedYear}</p>
        </div>
      </div>

      <div className={`${!isAuthenticated ? "filter blur-md select-none pointer-events-none" : ""} transition-all`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-xl tracking-wide">{seller.phone}</span>
          </div>
          
          <a href={`mailto:${seller.email}`} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-colors">
            <Mail className="w-5 h-5" /> Contact via Email
          </a>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 border-t border-gray-200 mt-20">
          <div className="bg-white shadow-xl border border-gray-100 p-6 rounded-xl flex flex-col items-center text-center w-full max-w-[280px]">
            <Lock className="w-8 h-8 text-[var(--color-shelby-red)] mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Unlock Contact</h4>
            <p className="text-sm text-gray-500 mb-4">Login to view seller info.</p>
            <Link href="/login" className="w-full bg-[var(--color-shelby-blue)] hover:bg-[#001D40] text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm shadow-md cursor-pointer">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
