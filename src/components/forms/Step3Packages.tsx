"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const PACKAGES = [
  { id: "STANDARD", name: "Standard Listing", price: 99, desc: "Standard search grid visibility.", features: ["Up to 20 High-Res Photos", "VIN Decoding", "Standard Placement"] },
  { id: "HOMEPAGE", name: "Homepage Featured", price: 149, desc: "Gets you on the homepage.", features: ["Featured Badge", "Homepage Carousel Placement", "Priority Search Highlighting"], recommended: true },
  { id: "HOMEPAGE_PLUS_ADS", name: "Homepage + Google Ads", price: 299, desc: "Maximum exposure globally.", features: ["Homepage Carousel Placement", "Dedicated Google Ads Campaign", "Social Media Spotlight"] }
];

export default function Step3Packages({ initialData, onNext, onBack }: any) {
  const [selected, setSelected] = useState(initialData.package_tier || "HOMEPAGE");

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-gray-900 mb-2">Select a Listing Package</h2>
        <p className="text-gray-500 text-sm">Choose the level of exposure you want for your Shelby.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => (
          <div 
            key={pkg.id} 
            onClick={() => setSelected(pkg.id)}
            className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all duration-300 ${
              selected === pkg.id 
                ? "border-[var(--color-shelby-blue)] bg-blue-50/50 shadow-lg scale-[1.02]" 
                : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
            }`}
          >
            {pkg.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-shelby-red)] text-white text-[10px] font-bold uppercase py-1 px-3 rounded-full shadow-md">
                Recommended
              </div>
            )}
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">{pkg.name}</h3>
            <div className="font-black text-3xl text-[var(--color-shelby-blue)] mb-2">${pkg.price}</div>
            <p className="text-xs text-gray-600 mb-4 min-h-[32px]">{pkg.desc}</p>
            <ul className="space-y-2 mb-4">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className={`w-full py-2 rounded-lg font-bold text-center text-sm transition-colors ${
              selected === pkg.id ? "bg-[var(--color-shelby-blue)] text-white" : "bg-gray-100 text-gray-800"
            }`}>
              {selected === pkg.id ? "Selected" : "Select"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
        <button type="button" onClick={onBack} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-sm">
          &larr; Back
        </button>
        <button onClick={() => onNext({ package_tier: selected })} className="px-8 py-3 bg-[var(--color-shelby-blue)] text-white font-bold rounded-lg hover:bg-[#001D40] transition-colors shadow-lg active:scale-95 text-sm">
          Continue to Payment &rarr;
        </button>
      </div>
    </div>
  );
}
