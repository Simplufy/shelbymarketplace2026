"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle, Eye, Image as ImageIcon } from "lucide-react";

export default function AdminDashboard() {
  const [listings, setListings] = useState([
    { id: "101", title: "2022 Ford Shelby Super Snake", vin: "1FA6P8SJ4N*****", price: 135000, package_tier: "HOMEPAGE_PLUS_ADS", status: "PENDING", date: "Today" },
    { id: "102", title: "1967 Ford Shelby GT500 Eleanor", vin: "6T02S1*****", price: 250000, package_tier: "HOMEPAGE", status: "PENDING", date: "Yesterday" },
    { id: "103", title: "2020 Ford Shelby GT350R", vin: "1FA6P8JZXL*****", price: 89000, package_tier: "STANDARD", status: "PENDING", date: "Oct 12" }
  ]);

  const approveListing = (id: string) => {
    setListings(listings.filter(l => l.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-gray-900 uppercase tracking-tight break-words">Review Pending Listings</h1>
          <p className="text-gray-500 mt-2 font-medium">Verify VINs, check photos for watermarks, and action premium ad campaigns.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm font-bold text-[var(--color-shelby-blue)] text-lg">
          {listings.length} Pending Review
        </div>
      </header>

      <div className="bg-white border md:rounded-3xl shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest">
                <th className="p-6 font-bold w-2/5">Vehicle Details</th>
                <th className="p-6 font-bold w-1/5">Package Tier</th>
                <th className="p-6 font-bold text-center w-1/5">Action Required</th>
                <th className="p-6 font-bold text-right w-1/5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-6 min-w-0">
                    <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 break-words">{l.title}</div>
                    <div className="text-sm font-mono text-gray-500 flex flex-wrap gap-2 sm:gap-4">
                      <span className="bg-gray-100 px-2 py-1 rounded break-all">VIN: {l.vin}</span>
                      <span className="font-sans font-bold text-[var(--color-shelby-blue)] py-1">${l.price.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${
                      l.package_tier === 'HOMEPAGE_PLUS_ADS' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      l.package_tier === 'HOMEPAGE' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {l.package_tier.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    {l.package_tier === "HOMEPAGE_PLUS_ADS" ? (
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2.5 rounded-lg border border-red-200 font-bold text-xs uppercase tracking-widest shadow-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Launch Google Ad
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium italic">Standard Verification</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 text-gray-400 hover:text-[var(--color-shelby-blue)] transition-colors hover:bg-gray-100 rounded-lg group-hover:bg-white" title="Review Photos">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-[var(--color-shelby-blue)] transition-colors hover:bg-gray-100 rounded-lg group-hover:bg-white" title="View Listing Draft">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => approveListing(l.id)} className="ml-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/10 transition-transform active:scale-95 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <CheckCircle className="w-5 h-5" /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-500">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium text-xl">No pending listings to review.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
