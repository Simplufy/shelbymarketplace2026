"use client";

import { FileText, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function VDPVehicleHistory({ isAuthenticated, vin, historyDetails }: { isAuthenticated: boolean, vin: string, historyDetails: any }) {
  const [isOpen, setIsOpen] = useState(isAuthenticated); // Keep open if authenticated

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
      <button 
        onClick={() => isAuthenticated && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[var(--color-shelby-blue)]" />
          <h3 className="font-heading font-bold text-xl text-gray-900">Vehicle History & VIN</h3>
        </div>
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-shelby-red)] uppercase tracking-wide">
            <Lock className="w-4 h-4" /> Locked
          </div>
        )}
      </button>

      {/* Content Area */}
      <div className={`relative transition-all duration-300 ${isOpen ? "h-auto border-t border-gray-200" : "h-0 overflow-hidden"}`}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">VIN</span>
                <span className="font-mono font-bold text-gray-900">{vin}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Owner Count</span>
                <span className="font-bold text-gray-900">{historyDetails.owners || 1}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Accident History</span>
                <span className="font-bold text-gray-900">{historyDetails.accidents || "None Reported"}</span>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col justify-center items-center text-center">
              <ShieldCheck className="w-12 h-12 text-green-600 mb-3" />
              <h4 className="font-bold text-green-900 mb-1">Seller Identity Verified</h4>
              <p className="text-sm text-green-700">The seller has passed our basic identity checks.</p>
            </div>
          </div>
        </div>

        {/* Unauthenticated Gating Overlay */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6 border-t border-gray-200">
            <Lock className="w-10 h-10 text-gray-400 mb-3" />
            <h4 className="font-heading font-bold text-2xl text-gray-900 mb-2">Unlock Vehicle History</h4>
            <p className="text-gray-600 mb-6 text-center max-w-sm">
              Create a free account or login to view the full VIN, ownership details, and accident history.
            </p>
            <Link href="/login" className="px-8 py-3 bg-[var(--color-shelby-blue)] hover:bg-[#001D40] text-white font-bold rounded-xl shadow-md transition-all">
              Login or Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
