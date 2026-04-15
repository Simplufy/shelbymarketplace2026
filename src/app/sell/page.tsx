"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import Step1VIN from "@/components/forms/Step1VIN";
import Step2Details from "@/components/forms/Step2Details";
import Step3Packages from "@/components/forms/Step3Packages";
import Step4Checkout from "@/components/forms/Step4Checkout";
import Link from "next/link";

function SuccessView() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="font-heading font-extrabold text-3xl text-gray-900 mb-4">Payment Successful!</h2>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
        Your listing has been submitted and is currently <strong className="text-orange-600">PENDING</strong> admin review.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/" 
          className="px-8 py-4 bg-[var(--color-shelby-blue)] text-white font-bold rounded-xl shadow-lg hover:bg-[#001D40] transition-all"
        >
          Return to Homepage
        </Link>
        <Link 
          href="/profile" 
          className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition-all"
        >
          View My Listings
        </Link>
      </div>
    </div>
  );
}

function SellForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const nextStep = (data: any) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const steps = ["Vehicle Details", "Photos & Specs", "Select Package", "Checkout"];

  // If payment was successful, show success view
  if (success === 'true') {
    return (
      <div className="min-h-screen bg-[#fafafb] py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-6 md:p-10">
            <SuccessView />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#E31837]/10 border border-[#E31837]/20 rounded-full mb-6">
            <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest">List Your Vehicle</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl tracking-tighter mb-3 break-words">
            Sell Your Shelby
          </h1>
          <p className="text-[#565d6d] max-w-lg mx-auto">List your Shelby with thousands of verified buyers. Fast, secure, and backed by trusted escrow services.</p>
        </div>

        {/* Stepper */}
        <div className="flex flex-row items-center justify-between mb-24 max-w-3xl mx-auto">
          {steps.map((label, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isPast = step > num;
            return (
              <div key={label} className="flex flex-col items-center relative flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg z-10 transition-colors shadow-sm ${
                  isActive ? "bg-[#002D72] text-white shadow-lg ring-4 ring-[#002D72]/20" : 
                  isPast ? "bg-[#E31837] text-white" : "bg-white text-[#565d6d] border-2 border-[#dee1e6]"
                }`}>
                  {isPast ? <Check className="w-6 h-6" /> : num}
                </div>
                <span className={`text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider mt-6 text-center w-24 sm:w-32 ${
                  isActive ? "text-[#002D72]" : 
                  isPast ? "text-[#E31837]" : "text-[#565d6d]"
                }`}>
                  {label}
                </span>
                
                {num !== steps.length && (
                  <div className={`absolute top-6 left-[50%] right-[-50%] h-1.5 transition-colors ${
                    isPast ? "bg-[#E31837]" : "bg-[#dee1e6]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-6 md:p-10">
          {step === 1 && <Step1VIN initialData={formData} onNext={nextStep} />}
          {step === 2 && <Step2Details initialData={formData} onNext={nextStep} onBack={() => setStep(1)} />}
          {step === 3 && <Step3Packages initialData={formData} onNext={nextStep} onBack={() => setStep(2)} />}
          {step === 4 && <Step4Checkout formData={formData} onBack={() => setStep(3)} />}
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafb] py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#002D72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#565d6d]">Loading...</p>
        </div>
      </div>
    }>
      <SellForm />
    </Suspense>
  );
}
