"use client";
import { CheckCircle2, Lock, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Step4Checkout({ formData, onBack }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_tier: formData.package_tier,
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
            serviceHistory: formData.serviceHistory,
            images: formData.images,
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-gray-900 mb-2">Review & Checkout</h2>
        <p className="text-gray-500 text-sm">You are one step away from listing your Shelby.</p>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-4">Vehicle Summary</h3>
        <div className="space-y-2 text-sm">
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

      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner">
        <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 text-sm">Package</span>
            <span className="font-bold">{getPackageName()}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 text-sm">Listing Fee</span>
            <span className="font-bold shrink-0">${getPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-4 text-xl font-black text-[var(--color-shelby-blue)] border-t-2 border-gray-300 mt-2">
            <span>Total</span>
            <span>${getPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-center gap-3 text-blue-900">
        <Lock className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-sm">Secure, encrypted payment powered by Stripe</span>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={loading}
          className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          &larr; Back
        </button>
        <button 
          onClick={handleCheckout} 
          disabled={loading}
          className="px-10 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${getPrice()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
