"use client";
import { CheckCircle2, Lock, CreditCard } from "lucide-react";
import { useState } from "react";

export default function Step4Checkout({ formData, onBack }: any) {
  const [success, setSuccess] = useState(false);

  const getPrice = () => {
    if (formData.package_tier === "HOMEPAGE_PLUS_ADS") return 299;
    if (formData.package_tier === "HOMEPAGE") return 149;
    return 99;
  };

  const handleCheckout = () => {
    // In a real app, this redirects to a Stripe Checkout Session
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-heading font-extrabold text-3xl text-gray-900 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Your listing has been submitted and is currently <strong className="text-orange-600">PENDING</strong> admin review.
        </p>
        <button onClick={() => window.location.href = "/"} className="px-8 py-4 bg-[var(--color-shelby-blue)] text-white font-bold rounded-xl shadow-lg hover:bg-[#001D40] transition-all">
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="font-heading font-extrabold text-3xl text-gray-900 mb-2">Review & Checkout</h2>
        <p className="text-gray-500">You are one step away from listing your Shelby.</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 shadow-inner">
        <h3 className="font-bold text-gray-900 text-xl tracking-tight mb-6">Order Summary</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 text-base sm:text-lg gap-1">
            <span className="text-gray-600 break-words">{formData.year} {formData.make} {formData.model} Listing</span>
            <span className="font-bold shrink-0">Included</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 text-base sm:text-lg gap-1">
            <span className="text-gray-600 break-words">Package: {formData.package_tier.replace(/_/g, " ")}</span>
            <span className="font-bold shrink-0">${getPrice()}</span>
          </div>
          <div className="flex justify-between items-center py-4 text-2xl font-black text-[var(--color-shelby-blue)] border-t-2 border-gray-300 mt-2">
            <span>Total</span>
            <span>${getPrice()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex items-center justify-center gap-3 text-blue-900 mb-8">
        <Lock className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-sm">Secure, encrypted payment powered by Stripe</span>
      </div>

      <div className="flex justify-between pt-8 border-t border-gray-100">
        <button type="button" onClick={onBack} className="px-6 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
          &larr; Back
        </button>
        <button onClick={handleCheckout} className="px-10 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg active:scale-95 flex items-center gap-2 text-lg">
          <CreditCard className="w-6 h-6" /> Pay ${getPrice()}
        </button>
      </div>
    </div>
  );
}
