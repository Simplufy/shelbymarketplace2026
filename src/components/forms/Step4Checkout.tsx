"use client";
import { Lock, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ADDON_CATALOG = [
  {
    id: "carfax_report",
    name: "CarFax Report",
    description: "Add Vehicle History Report",
    price: 29,
    defaultChecked: false,
  },
  {
    id: "featured_listing",
    name: "Featured Listing",
    description: "Feature My Listing",
    price: 79,
    defaultChecked: true,
  },
  {
    id: "social_media_promotion",
    name: "Social Media Promotion",
    description: "Promote on Social Media",
    price: 99,
    defaultChecked: false,
  },
  {
    id: "email_blast",
    name: "Email Blast",
    description: "Send your listing to our buyer email list",
    price: 29,
    defaultChecked: false,
  },
  {
    id: "urgent_badge",
    name: "Urgent Badge",
    description: "Highlight your listing with an urgent badge",
    price: 29,
    defaultChecked: false,
  },
  {
    id: "video_showcase",
    name: "Video Showcase",
    description: "Add Video Showcase",
    price: 49,
    defaultChecked: false,
  },
  {
    id: "concierge_service",
    name: "Concierge Service",
    description: "We write, optimize, and position your listing",
    price: 129,
    defaultChecked: false,
  },
  {
    id: "pro_seller_package",
    name: "Pro Seller Package",
    description: "Featured + Social + Email Blast + Urgent Badge + CarFax",
    price: 199,
    defaultChecked: false,
    isRecommended: true,
  },
] as const;

export default function Step4Checkout({ formData, onBack }: any) {
  const supabase = createClient();
  const packageIncludesFeatured =
    formData.package_tier === "HOMEPAGE" || formData.package_tier === "HOMEPAGE_PLUS_ADS";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const addon of ADDON_CATALOG) {
      if (packageIncludesFeatured && addon.id === "featured_listing") {
        defaults[addon.id] = false;
      } else {
        defaults[addon.id] = addon.defaultChecked;
      }
    }
    return defaults;
  });

  const visibleAddons = ADDON_CATALOG.filter(
    (addon) => !(packageIncludesFeatured && addon.id === "featured_listing")
  );

  const getPrice = () => {
    if (formData.package_tier === "HOMEPAGE_PLUS_ADS") return 299;
    if (formData.package_tier === "HOMEPAGE") return 149;
    return 99;
  };

  const getPackageName = () => {
    if (formData.package_tier === "HOMEPAGE_PLUS_ADS") return "Homepage + Google Ads";
    if (formData.package_tier === "HOMEPAGE") return "Homepage Featured";
    return "Standard Listing";
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const next = { ...prev, [addonId]: !prev[addonId] };

      // Bundle behavior: selecting Pro Seller auto-includes key promotions
      if (addonId === "pro_seller_package" && !prev[addonId]) {
        if (!packageIncludesFeatured) {
          next.featured_listing = true;
        }
        next.social_media_promotion = true;
        next.email_blast = true;
        next.urgent_badge = true;
        next.carfax_report = true;
      }

      return next;
    });
  };

  const selectedAddonItems = visibleAddons.filter((addon) => selectedAddons[addon.id]);
  const addonsTotal = selectedAddonItems.reduce((sum, addon) => sum + addon.price, 0);
  const total = getPrice() + addonsTotal;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Create checkout session
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          package_tier: formData.package_tier,
          selected_addons: selectedAddonItems.map((addon) => addon.id),
          vehicle_info: {
            vin: formData.vin,
            year: formData.year,
            make: formData.make,
            model: formData.model,
            trim: formData.trim,
            price: formData.price,
            mileage: formData.mileage,
            description: formData.description,
            location: formData.location,
            transmission: formData.transmission,
            drivetrain: formData.drivetrain,
            serviceHistory: formData.serviceHistory,
            images: formData.images,
            primaryImageIndex: formData.primaryImageIndex || 0,
            listingTags: formData.listingTags || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="font-heading font-extrabold text-lg md:text-2xl text-gray-900 mb-1 md:mb-2">Review & Checkout</h2>
        <p className="text-gray-500 text-xs md:text-sm">You are one step away from listing your Shelby.</p>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
        <h3 className="font-bold text-gray-900 text-base md:text-lg tracking-tight mb-3 md:mb-4">Vehicle Summary</h3>
        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicle</span>
            <span className="font-medium">{formData.year} {formData.make} {formData.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">VIN</span>
            <span className="font-medium font-mono">{formData.vin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Asking Price</span>
            <span className="font-medium">${Number(formData.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mileage</span>
            <span className="font-medium">{Number(formData.mileage).toLocaleString()} mi</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">{formData.location}</span>
          </div>
          {formData.images && formData.images.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Photos</span>
              <span className="font-medium">{formData.images.length} uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Upsells */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 shadow-inner">
        <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#E31837]" />
          <h3 className="font-bold text-gray-900 text-base md:text-lg tracking-tight">Boost Your Listing</h3>
        </div>

        <div className="space-y-2 md:space-y-3">
          {visibleAddons.map((addon) => (
            <label
              key={addon.id}
              className={`block rounded-xl border p-3 md:p-4 cursor-pointer transition-colors ${
                selectedAddons[addon.id]
                  ? "border-[#002D72] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 md:gap-3">
                <div className="flex items-start gap-2 md:gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAddons[addon.id]}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 accent-[#002D72]"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs md:text-sm">{addon.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-600">{addon.description}</p>
                    {("isRecommended" in addon && addon.isRecommended) && (
                      <span className="inline-flex mt-1.5 md:mt-2 px-1.5 md:px-2 py-0.5 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#E31837]/10 text-[#E31837]">
                        Most sellers choose this
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-xs md:text-sm text-gray-900 shrink-0">+${addon.price}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 shadow-inner">
        <h3 className="font-bold text-gray-900 text-base md:text-lg tracking-tight mb-3 md:mb-4">Order Summary</h3>
        
        <div className="space-y-2 md:space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 md:py-3 border-b border-gray-200">
            <span className="text-gray-600 text-xs md:text-sm">Package</span>
            <span className="font-bold">{getPackageName()}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 md:py-3 border-b border-gray-200">
            <span className="text-gray-600 text-xs md:text-sm">Listing Fee</span>
            <span className="font-bold shrink-0">${getPrice().toFixed(2)}</span>
          </div>
          {selectedAddonItems.map((addon) => (
            <div key={addon.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 md:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-xs md:text-sm">{addon.name}</span>
              <span className="font-bold shrink-0">+${addon.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-3 md:py-4 text-lg md:text-xl font-black text-[var(--color-shelby-blue)] border-t-2 border-gray-300 mt-1 md:mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 md:p-4 rounded-xl text-red-700 text-xs md:text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-blue-900">
        <Lock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
        <span className="font-medium text-xs md:text-sm">Secure, encrypted payment powered by Stripe</span>
      </div>

      <div className="flex justify-between pt-4 md:pt-6 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={loading}
          className="px-4 md:px-6 py-2 md:py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-xs md:text-sm disabled:opacity-50"
        >
          &larr; Back
        </button>
        <button 
          onClick={handleCheckout} 
          disabled={loading}
          className="px-6 md:px-10 py-2 md:py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg active:scale-95 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              Pay ${total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
