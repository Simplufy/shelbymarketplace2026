"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, UploadCloud, Shield, TrendingUp, Users, CheckCircle2, Building2, Globe, Phone, MapPin, ArrowLeft, ArrowRight } from "lucide-react";

const SUBSCRIPTIONS = [
  { id: "ENTHUSIAST", name: "Enthusiast Dealer", price: 400, desc: "Perfect for specialty dealers moving low volume of Shelby vehicles.", features: ["Up to 10 active listings/mo", "Bypass one-time listing fees", "Admin prioritized review", "Dealer Profile Verification badge"] },
  { id: "APEX", name: "Apex Dealer", price: 1000, desc: "For high-volume dealerships dominating the performance market.", features: ["Unlimited active listings", "Bypass one-time listing fees", "Immediate auto-approval", "Homepage Featured Slot (1/mo)", "Dedicated Account Manager"], recommended: true },
];

export default function DealerRegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState("APEX");
  const steps = ["Dealership Info", "Documents", "Select Plan", "Review"];

  return (
    <div className="min-h-screen bg-[#fafafb] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#002D72] rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>
            <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest">Dealer Registration</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl tracking-tighter mb-3 break-words">Join the Shelby Exchange</h1>
          <p className="text-[#565d6d] max-w-lg mx-auto">Apply for dealer access in minutes. Our team will review your application within 24 hours.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
          {steps.map((label, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isPast = step > num;
            return (
              <div key={label} className="flex flex-col items-center relative flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${isActive ? "bg-[#002D72] text-white ring-4 ring-[#002D72]/20" : isPast ? "bg-[#E31837] text-white" : "bg-white text-[#565d6d] border-2 border-[#dee1e6]"}`}>
                  {isPast ? <Check className="w-5 h-5" /> : num}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-3 text-center w-16 sm:w-auto ${isActive ? "text-[#002D72]" : isPast ? "text-[#E31837]" : "text-[#565d6d]"}`}>{label}</span>
                {num !== steps.length && <div className={`absolute top-5 left-[50%] right-[-50%] h-0.5 ${isPast ? "bg-[#E31837]" : "bg-[#dee1e6]"}`} />}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-8 md:p-12">
          {/* Step 1: Dealership Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Dealership Information</h2>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Dealership Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                  <input type="text" placeholder="e.g. Shelby Performance Motors" className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Dealer License #</label>
                  <input type="text" placeholder="DL-12345678" className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input type="url" placeholder="https://yourdealer.com" className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input type="tel" placeholder="(555) 123-4567" className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input type="text" placeholder="City, State" className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={() => setStep(2)} className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Required Documents</h2>
              <p className="text-sm text-[#565d6d] mb-6">Upload copies of required documents. These will be verified by our admin team within 24 hours.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[{ title: "Copy of Dealer License", desc: "State-issued dealer license" }, { title: "Proof of Insurance", desc: "Certificate of liability insurance" }, { title: "Business Registration", desc: "State or county business registration" }, { title: "Tax ID Document", desc: "EIN or tax identification" }].map((doc) => (
                  <div key={doc.title} className="border-2 border-dashed border-[#dee1e6] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#fafafb] hover:bg-[#002D72]/5 hover:border-[#002D72]/30 transition-all cursor-pointer group">
                    <UploadCloud className="w-10 h-10 mb-3 text-[#002D72] group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm text-[#171a1f] mb-1">{doc.title}</p>
                    <p className="text-[10px] text-[#565d6d]">{doc.desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-[#dee1e6] text-[#565d6d] font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => setStep(3)} className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Select Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBSCRIPTIONS.map((pkg) => (
                  <div key={pkg.id} onClick={() => setSelectedTier(pkg.id)} className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all bg-white ${selectedTier === pkg.id ? "border-[#002D72] shadow-xl scale-[1.02]" : "border-[#dee1e6] hover:border-[#002D72]/30 opacity-70 hover:opacity-100"}`}>
                    {pkg.recommended && selectedTier === pkg.id && (
                      <div className="absolute top-4 right-4 bg-[#E31837] text-white text-[10px] uppercase font-black px-3 py-1 rounded shadow-md tracking-wider">Best Value</div>
                    )}
                    <h3 className="font-outfit font-bold text-xl mb-1">{pkg.name}</h3>
                    <div className="font-black text-2xl sm:text-3xl text-[#002D72] mb-2 break-words">${pkg.price} <span className="text-sm text-[#565d6d] font-medium">/ month</span></div>
                    <p className="text-sm text-[#565d6d] mb-6">{pkg.desc}</p>
                    <ul className="space-y-2">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium border-b border-[#f3f4f6] pb-2 last:border-0">
                          <Check className="w-4 h-4 text-[#E31837] shrink-0 mt-0.5" /><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-3 border border-[#dee1e6] text-[#565d6d] font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => setStep(4)} className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors">Review & Submit <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-outfit font-black text-3xl mb-4">Application Submitted!</h2>
              <p className="text-lg text-[#565d6d] mb-4 max-w-lg mx-auto">Your dealer documents are currently <strong className="text-[#002D72]">PENDING</strong> review. Our admin team will verify your license within 24 hours.</p>
              <p className="text-xs text-[#565d6d] mb-10 uppercase tracking-widest font-bold">Subscription payment processed securely via Stripe</p>
              <Link href="/" className="inline-block px-10 py-4 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors">Return to Homepage</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
