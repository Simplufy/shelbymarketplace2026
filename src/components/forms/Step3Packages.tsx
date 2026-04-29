"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const PACKAGES = [
  { id: "STANDARD", name: "Standard Listing", price: 99, desc: "Standard visibility for budget-conscious sellers.", features: ["Up to 20 High-Res Photos", "VIN Decoding", "Standard Placement"], cta: "List My Shelby" },
  { id: "HOMEPAGE", name: "Homepage Featured", price: 149, desc: "Designed to sell faster with increased visibility.", features: ["Featured Badge", "Homepage Carousel Placement", "Priority Search Highlighting", "Limited featured spots available each week"], recommended: true, note: "⭐ Most sellers choose this option", cta: "Get More Exposure" },
  { id: "HOMEPAGE_PLUS_ADS", name: "Premium Exposure Package", price: 299, desc: "Maximum exposure for fastest possible sale.", features: ["Homepage Featured Placement (Top Section)", "Email Blast to Shelby Buyers 🔥", "Social Media Promotion 🔥", "Priority Search Ranking", "2x Visibility vs Standard", "Limited featured spots available each week"], cta: "Maximize My Sale" }
];

export default function Step3Packages({ initialData, onNext, onBack }: any) {
  const [selected, setSelected] = useState(initialData.package_tier || "HOMEPAGE");

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="font-heading font-extrabold text-lg md:text-2xl text-gray-900 mb-1 md:mb-2">Select a Listing Package</h2>
        <p className="text-gray-500 text-xs md:text-sm">Choose the level of exposure you want for your Shelby.</p>
        <p className="text-[#002D72] text-[11px] md:text-xs font-bold mt-2">Listings on other platforms cost $200-$500+ with less exposure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {PACKAGES.map((pkg) => (
          <div 
            key={pkg.id} 
            onClick={() => setSelected(pkg.id)}
            className={`relative rounded-2xl p-3 md:p-4 border-2 cursor-pointer transition-all duration-300 ${
              selected === pkg.id 
                ? "border-[var(--color-shelby-blue)] bg-blue-50/50 shadow-lg scale-[1.02]" 
                : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
            } ${pkg.recommended ? "shadow-xl shadow-[var(--color-shelby-blue)]/10" : ""}`}
          >
            {pkg.recommended && (
              <div className="absolute -top-2.5 md:-top-3 left-1/2 -translate-x-1/2 bg-[var(--color-shelby-red)] text-white text-[8px] md:text-[10px] font-bold uppercase py-0.5 md:py-1 px-2 md:px-3 rounded-full shadow-md">
                Recommended
              </div>
            )}
            <h3 className="font-heading font-bold text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1">{pkg.name}</h3>
            <div className="font-black text-2xl md:text-3xl text-[var(--color-shelby-blue)] mb-1 md:mb-2">${pkg.price}</div>
            <p className="text-[10px] md:text-xs text-gray-600 mb-3 md:mb-4 min-h-[28px] md:min-h-[32px]">{pkg.desc}</p>
            {pkg.note ? <p className="text-[10px] md:text-xs font-black text-[#E31837] mb-3">{pkg.note}</p> : null}
            <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-700 font-medium">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className={`w-full py-1.5 md:py-2 rounded-lg font-bold text-center text-xs md:text-sm transition-colors ${
              selected === pkg.id ? "bg-[var(--color-shelby-blue)] text-white" : "bg-gray-100 text-gray-800"
            }`}>
              {selected === pkg.id ? "Selected" : pkg.cta}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 md:pt-6 border-t border-gray-100 mt-4 md:mt-6">
        <button type="button" onClick={onBack} className="px-4 md:px-6 py-2 md:py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-xs md:text-sm">
          &larr; Back
        </button>
        <button onClick={() => onNext({ package_tier: selected })} className="px-6 md:px-8 py-2 md:py-3 bg-[var(--color-shelby-blue)] text-white font-bold rounded-lg hover:bg-[#001D40] transition-colors shadow-lg active:scale-95 text-xs md:text-sm">
          Continue to Payment &rarr;
        </button>
      </div>
    </div>
  );
}
