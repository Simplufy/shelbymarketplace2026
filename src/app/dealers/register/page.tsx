"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, UploadCloud, CheckCircle2, Building2, Globe, Phone, MapPin, ArrowLeft, ArrowRight, Loader2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SUBSCRIPTIONS = [
  { id: "ENTHUSIAST", name: "Enthusiast Dealer", price: 400, desc: "Perfect for specialty dealers moving low volume of Shelby vehicles.", features: ["Up to 10 active listings/mo", "Bypass one-time listing fees", "Admin prioritized review", "Dealer Profile Verification badge"] },
  { id: "APEX", name: "Apex Dealer", price: 1000, desc: "For high-volume dealerships dominating the performance market.", features: ["Unlimited active listings", "Bypass one-time listing fees", "Immediate auto-approval", "Homepage Featured Slot (1/mo)", "Dedicated Account Manager"], recommended: true },
];

const REQUIRED_DOCS = [
  { key: "dealer_license", title: "Copy of Dealer License", desc: "State-issued dealer license" },
  { key: "insurance", title: "Proof of Insurance", desc: "Certificate of liability insurance" },
  { key: "business_registration", title: "Business Registration", desc: "State or county business registration" },
  { key: "tax_id", title: "Tax ID Document", desc: "EIN or tax identification" },
];

function DealerRegisterForm() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState("APEX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const success = searchParams.get('success');
  const steps = ["Dealership Info", "Documents", "Select Plan", "Review"];

  // Form state
  const [formData, setFormData] = useState({
    dealership_name: "",
    dealer_license: "",
    website: "",
    phone: "",
    location: "",
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/dealers/register');
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (docKey: string, file: File) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [docKey]: true }));
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathname", `dealer-docs/${Date.now()}-${docKey}.${file.name.split('.').pop()}`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setUploadedDocs(prev => ({ ...prev, [docKey]: data.url }));
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to upload ${docKey}: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dealers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          documents: uploadedDocs,
          subscription_tier: selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setStep(4); // Show success
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.dealership_name && formData.dealer_license && formData.phone && formData.location;
      case 2:
        return Object.keys(uploadedDocs).length >= 2; // At least 2 documents
      case 3:
        return true;
      default:
        return true;
    }
  };

  // Success state
  if (success === 'true') {
    return (
      <div className="min-h-screen bg-[#fafafb] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-outfit font-black text-3xl mb-4">Registration Complete!</h2>
            <p className="text-lg text-[#565d6d] mb-4 max-w-lg mx-auto">
              Your subscription is active and your dealer documents are currently <strong className="text-[#002D72]">PENDING</strong> review.
            </p>
            <p className="text-sm text-[#565d6d] mb-8">
              Our admin team will verify your license within 24 hours. You&apos;ll receive an email notification once approved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dealers" className="px-10 py-4 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors">
                Return to Dealers
              </Link>
              <Link href="/" className="px-10 py-4 border-2 border-[#dee1e6] text-[#565d6d] font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-8 md:p-12">
          {/* Step 1: Dealership Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Dealership Information</h2>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                  Dealership Name <span className="text-[#E31837]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                  <input 
                    type="text" 
                    value={formData.dealership_name}
                    onChange={(e) => handleInputChange('dealership_name', e.target.value)}
                    placeholder="e.g. Shelby Performance Motors" 
                    className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                    Dealer License # <span className="text-[#E31837]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.dealer_license}
                    onChange={(e) => handleInputChange('dealer_license', e.target.value)}
                    placeholder="DL-12345678" 
                    className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input 
                      type="url" 
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourdealer.com" 
                      className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                    Contact Phone <span className="text-[#E31837]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567" 
                      className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                    Location <span className="text-[#E31837]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State" 
                      className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" 
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!isStepValid()}
                  className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Required Documents</h2>
              <p className="text-sm text-[#565d6d] mb-6">
                Upload copies of required documents. These will be verified by our admin team within 24 hours.
                <span className="text-[#E31837] font-bold"> At least 2 documents required.</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REQUIRED_DOCS.map((doc) => (
                  <label 
                    key={doc.key} 
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                      uploadedDocs[doc.key] 
                        ? "border-green-500 bg-green-50" 
                        : "border-[#dee1e6] bg-[#fafafb] hover:bg-[#002D72]/5 hover:border-[#002D72]/30"
                    }`}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                      disabled={uploading[doc.key]}
                    />
                    {uploading[doc.key] ? (
                      <Loader2 className="w-10 h-10 mb-3 text-[#002D72] animate-spin" />
                    ) : uploadedDocs[doc.key] ? (
                      <CheckCircle2 className="w-10 h-10 mb-3 text-green-500" />
                    ) : (
                      <UploadCloud className="w-10 h-10 mb-3 text-[#002D72] group-hover:scale-110 transition-transform" />
                    )}
                    <p className="font-bold text-sm text-[#171a1f] mb-1">{doc.title}</p>
                    <p className="text-[10px] text-[#565d6d]">{uploadedDocs[doc.key] ? 'Uploaded successfully' : doc.desc}</p>
                    {uploadedDocs[doc.key] && (
                      <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Document saved
                      </p>
                    )}
                  </label>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-[#dee1e6] text-[#565d6d] font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!isStepValid()}
                  className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Select Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBSCRIPTIONS.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    onClick={() => setSelectedTier(pkg.id)} 
                    className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all bg-white ${selectedTier === pkg.id ? "border-[#002D72] shadow-xl scale-[1.02]" : "border-[#dee1e6] hover:border-[#002D72]/30 opacity-70 hover:opacity-100"}`}
                  >
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
                <button onClick={() => setStep(2)} className="px-6 py-3 border border-[#dee1e6] text-[#565d6d] font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={() => setStep(4)} 
                  className="px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#001D4A] transition-colors"
                >
                  Review & Submit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-outfit font-bold text-2xl mb-6">Review Your Application</h2>
              
              {/* Dealership Info Summary */}
              <div className="bg-[#fafafb] rounded-xl p-6">
                <h3 className="font-bold text-[#171a1f] mb-4">Dealership Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#565d6d]">Name:</span>
                    <span className="ml-2 font-medium">{formData.dealership_name}</span>
                  </div>
                  <div>
                    <span className="text-[#565d6d]">License:</span>
                    <span className="ml-2 font-medium">{formData.dealer_license}</span>
                  </div>
                  <div>
                    <span className="text-[#565d6d]">Phone:</span>
                    <span className="ml-2 font-medium">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#565d6d]">Location:</span>
                    <span className="ml-2 font-medium">{formData.location}</span>
                  </div>
                  {formData.website && (
                    <div className="md:col-span-2">
                      <span className="text-[#565d6d]">Website:</span>
                      <span className="ml-2 font-medium">{formData.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-[#fafafb] rounded-xl p-6">
                <h3 className="font-bold text-[#171a1f] mb-4">Uploaded Documents ({Object.keys(uploadedDocs).length}/4)</h3>
                <div className="flex flex-wrap gap-2">
                  {REQUIRED_DOCS.map((doc) => (
                    <span 
                      key={doc.key}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        uploadedDocs[doc.key] 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {uploadedDocs[doc.key] ? '✓' : '○'} {doc.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subscription Summary */}
              <div className="bg-[#002D72]/5 rounded-xl p-6 border border-[#002D72]/20">
                <h3 className="font-bold text-[#171a1f] mb-4">Selected Plan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">
                      {SUBSCRIPTIONS.find(s => s.id === selectedTier)?.name}
                    </p>
                    <p className="text-sm text-[#565d6d]">
                      Monthly subscription with automatic renewal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-[#002D72]">
                      ${SUBSCRIPTIONS.find(s => s.id === selectedTier)?.price}
                      <span className="text-sm font-medium text-[#565d6d]">/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(3)} className="px-6 py-3 border border-[#dee1e6] text-[#565d6d] font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-[#E31837] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#c41530] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function DealerRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafb] py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#002D72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#565d6d]">Loading...</p>
        </div>
      </div>
    }>
      <DealerRegisterForm />
    </Suspense>
  );
}
