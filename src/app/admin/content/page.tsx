"use client";

import { useState, useEffect } from "react";
import { 
  Save, Type, Layout, Eye, ArrowLeft, Upload,
  CheckCircle, AlertCircle, Search, Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Types for CMS content
type HeroContent = {
  badge: string;
  headline: string;
  subheadline: string;
  heroImage: string;
  searchPlaceholder: string;
  ctaText: string;
};

type WhySellReason = {
  num: string;
  title: string;
  description: string;
};

type HowItWorksStep = {
  step: string;
  icon: string;
  title: string;
  description: string;
};

type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
};

type Testimonial = {
  name: string;
  location: string;
  text: string;
  rating: number;
};

type SiteContent = {
  hero: HeroContent;
  featuredListingIds: string[];
  whySellTitle: string;
  whySellSubtitle: string;
  whySellReasons: WhySellReason[];
  whyBuyTitle: string;
  whyBuySubtitle: string;
  whyBuyReasons: WhySellReason[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaImage: string;
  howItWorksSteps: HowItWorksStep[];
  pricingTiers: PricingTier[];
  testimonials: Testimonial[];
};

// Default content matching current homepage
const defaultContent: SiteContent = {
  hero: {
    badge: "Exclusively Shelby",
    headline: "The Fastest Way to Buy or Sell a Ford Shelby",
    subheadline: "Join 1000+ Shelby enthusiasts buying and selling GT350s, GT500s & rare builds nationwide",
    heroImage: "/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg",
    searchPlaceholder: "Search by Model, Year, or ZIP...",
    ctaText: "Search Inventory"
  },
  featuredListingIds: ["1", "2", "3", "4"],
  whySellTitle: "Why Sell With Shelby Exchange?",
  whySellSubtitle: "Join thousands of satisfied sellers who trust our platform to connect with serious Shelby buyers worldwide.",
  whySellReasons: [
    {
      num: "01",
      title: "Verified Listings",
      description: "Every listing undergoes our rigorous verification process. Buyers trust our platform because they know each vehicle has been authenticated, ensuring you connect with serious, qualified buyers who are ready to purchase."
    },
    {
      num: "02",
      title: "Shelby Customers Look for Us",
      description: "Our marketplace is the first destination for Shelby enthusiasts worldwide. When collectors and enthusiasts search for their next performance vehicle, they come to Shelby Exchange first—putting your listing in front of the right audience."
    },
    {
      num: "03",
      title: "No Transaction Fees",
      description: "Keep more of your money. Unlike other marketplaces that charge hefty commissions on every sale, we offer zero transaction fees. You only pay a simple listing fee or choose our subscription model for unlimited listings."
    },
    {
      num: "04",
      title: "Dealer Discounted Rates",
      description: "Professional dealers benefit from our exclusive subscription plans with significant savings. Starter, Growth, and Apex packages help dealers scale exposure, leads, and sales."
    }
  ],
  whyBuyTitle: "Why Buy With Shelby Exchange?",
  whyBuySubtitle: "Find verified Shelby inventory faster with transparent details, trusted sellers, and enthusiast-focused search tools.",
  whyBuyReasons: [
    {
      num: "01",
      title: "Verified Shelby Inventory",
      description: "Every listing is reviewed for authenticity and quality so buyers can shop with confidence.",
    },
    {
      num: "02",
      title: "Real Market Pricing",
      description: "Compare current listings in one place and identify fair-market opportunities quickly.",
    },
    {
      num: "03",
      title: "Direct Seller Contact",
      description: "Reach verified sellers directly for details on history, options, and condition.",
    },
    {
      num: "04",
      title: "Collector-Focused Search",
      description: "Filter by model, year, transmission, mileage, and location to find exact specs.",
    },
  ],
  ctaTitle: "FIND THE SPEC NOBODY ELSE CAN.",
  ctaSubtitle: "Whether you're looking for a track-ready GT350R or a pristine 1960s classic, the Ford Shelby Exchange is your definitive destination.",
  ctaImage: "/images/c5f4c-hi-tech-mustang-front.webp",
  howItWorksSteps: [
    { step: "Step 1", icon: "upload", title: "Create Your Listing", description: "Fill in your Shelby's details, upload photos, and choose your listing package. Our VIN decoder auto-fills most specs." },
    { step: "Step 2", icon: "megaphone", title: "Get Maximum Exposure", description: "Your listing goes live instantly to our nationwide network of Shelby buyers. Featured packages get homepage placement." },
    { step: "Step 3", icon: "coins", title: "Close the Deal", description: "Connect directly with serious buyers. We provide secure escrow services to ensure a safe, smooth transaction." }
  ],
  pricingTiers: [
    { name: "Standard Listing", price: "$99", description: "Standard visibility for budget-conscious sellers.", features: ["Up to 20 High-Res Photos", "VIN Decoding", "Standard Placement"], cta: "List My Shelby", popular: false },
    { name: "Homepage Featured", price: "$149", description: "Designed to sell faster with increased visibility.", features: ["Featured Badge", "Homepage Carousel Placement", "Priority Search Highlighting"], cta: "Get More Exposure", popular: true },
    { name: "Premium Exposure Package", price: "$299", description: "Maximum exposure for fastest possible sale.", features: ["Homepage Featured Placement (Top Section)", "Email Blast to Shelby Buyers 🔥", "Social Media Promotion 🔥", "Priority Search Ranking", "2x Visibility vs Standard"], cta: "Maximize My Sale", popular: false }
  ],
  testimonials: [
    { name: "Mike R.", location: "Dallas, TX", text: "Sold my GT500 in 3 weeks. The process was smooth and the buyers were serious. Way better than dealing with dealers.", rating: 5 },
    { name: "Sarah K.", location: "Phoenix, AZ", text: "I was nervous selling online but the escrow service gave me confidence. Got top dollar for my GT350R.", rating: 5 },
    { name: "James T.", location: "Miami, FL", text: "The homepage featured package was worth every penny. Had 12 inquiries in the first week.", rating: 5 },
    { name: "David L.", location: "Denver, CO", text: "Finally a marketplace just for Shelby owners. The community here actually knows what these cars are worth.", rating: 5 },
    { name: "Chris M.", location: "Atlanta, GA", text: "Sold my Super Snake without the usual dealer hassle. The listing tools made it easy to showcase the car.", rating: 5 },
    { name: "Ryan P.", location: "Seattle, WA", text: "Best platform for selling performance cars. The verification process builds trust with buyers immediately.", rating: 5 }
  ]
};

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<"hero" | "featured" | "why-sell" | "why-buy" | "how-it-works" | "pricing" | "testimonials" | "cta">("hero");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [listings, setListings] = useState<Array<{id: string; title: string; price: number; image: string}>>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCta, setUploadingCta] = useState(false);
  
  const { user: authUser } = useAuth();

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      ),
    ]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'cta') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'hero') {
      setUploadingHero(true);
    } else {
      setUploadingCta(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathname", `site/${type}-${Date.now()}.${file.name.split('.').pop()}`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      if (type === 'hero') {
        updateHero('heroImage', data.url);
      } else {
        setContent(prev => ({ ...prev, ctaImage: data.url }));
      }
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload image: ${message}`);
    }

    if (type === 'hero') {
      setUploadingHero(false);
    } else {
      setUploadingCta(false);
    }
  };

  // Load content from Supabase on mount
  useEffect(() => {
    loadContent();
    loadListings();

    const safety = setTimeout(() => {
      setIsLoading(false);
    }, 12000);

    return () => clearTimeout(safety);
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms-content');
      const result = await res.json();
      
      if (result.error) {
        console.error("Load error:", result.error);
      }
      
      if (result.data) {
        const loadedContent = { ...defaultContent };
        
        if (result.data.hero) {
          loadedContent.hero = result.data.hero as HeroContent;
        }
        if (result.data.featured_listings) {
          loadedContent.featuredListingIds = (result.data.featured_listings as string[]) || [];
        }
        if (result.data.why_sell) {
          const why = result.data.why_sell as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
          loadedContent.whySellTitle = why.title || loadedContent.whySellTitle;
          loadedContent.whySellSubtitle = why.subtitle || loadedContent.whySellSubtitle;
          loadedContent.whySellReasons = why.reasons || loadedContent.whySellReasons;
        }
        if (result.data.why_buy) {
          const why = result.data.why_buy as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
          loadedContent.whyBuyTitle = why.title || loadedContent.whyBuyTitle;
          loadedContent.whyBuySubtitle = why.subtitle || loadedContent.whyBuySubtitle;
          loadedContent.whyBuyReasons = why.reasons || loadedContent.whyBuyReasons;
        }
        if (result.data.cta) {
          const cta = result.data.cta as { title?: string; subtitle?: string; image?: string };
          loadedContent.ctaTitle = cta.title || loadedContent.ctaTitle;
          loadedContent.ctaSubtitle = cta.subtitle || loadedContent.ctaSubtitle;
          loadedContent.ctaImage = cta.image || loadedContent.ctaImage;
        }
        if (result.data.how_it_works) {
          const hiw = result.data.how_it_works as { steps?: HowItWorksStep[] };
          loadedContent.howItWorksSteps = hiw.steps || loadedContent.howItWorksSteps;
        }
        if (result.data.pricing) {
          const pricing = result.data.pricing as { tiers?: PricingTier[] };
          loadedContent.pricingTiers = pricing.tiers || loadedContent.pricingTiers;
        }
        if (result.data.testimonials) {
          const testimonials = result.data.testimonials as { items?: Testimonial[] };
          loadedContent.testimonials = testimonials.items || loadedContent.testimonials;
        }
        
        setContent(loadedContent);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
    setIsLoading(false);
  };

  const loadListings = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/admin/active-listings", { signal: controller.signal });
      clearTimeout(timeout);

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to load active listings");
      }

      setListings(result.data || []);
    } catch (error) {
      console.error("Error loading listings:", error);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      setSaveMessage({ type: "error", text: "You must be logged in to save changes" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Save all content sections
      const sections = [
        { key: "hero", value: content.hero },
        { key: "featured_listings", value: content.featuredListingIds },
        { key: "why_sell", value: {
          title: content.whySellTitle,
          subtitle: content.whySellSubtitle,
          reasons: content.whySellReasons
        }},
        { key: "why_buy", value: {
          title: content.whyBuyTitle,
          subtitle: content.whyBuySubtitle,
          reasons: content.whyBuyReasons
        }},
        { key: "cta", value: {
          title: content.ctaTitle,
          subtitle: content.ctaSubtitle,
          image: content.ctaImage
        }},
        { key: "how_it_works", value: { steps: content.howItWorksSteps }},
        { key: "pricing", value: { tiers: content.pricingTiers }},
        { key: "testimonials", value: { items: content.testimonials }}
      ];

      const saveRequest = fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      }).then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to save content");
        }
        return payload;
      });

      await withTimeout(saveRequest, 10000, "Saving homepage content");

      // Also save to localStorage as backup
      localStorage.setItem("shelby_cms_content", JSON.stringify(content));
      
      setSaveMessage({ type: "success", text: "Changes saved successfully!" });
    } catch (error: unknown) {
      console.error("Error saving content:", error);
      const message = error instanceof Error ? error.message : "Failed to save changes. Please try again.";
      setSaveMessage({ type: "error", text: message });
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const updateHero = (field: keyof HeroContent, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateWhySellReason = (index: number, field: keyof WhySellReason, value: string) => {
    setContent(prev => ({
      ...prev,
      whySellReasons: prev.whySellReasons.map((reason, i) => 
        i === index ? { ...reason, [field]: value } : reason
      )
    }));
  };

  const updateWhyBuyReason = (index: number, field: keyof WhySellReason, value: string) => {
    setContent(prev => ({
      ...prev,
      whyBuyReasons: prev.whyBuyReasons.map((reason, i) =>
        i === index ? { ...reason, [field]: value } : reason
      )
    }));
  };

  const toggleFeaturedListing = (id: string) => {
    setContent(prev => ({
      ...prev,
      featuredListingIds: prev.featuredListingIds.includes(id)
        ? prev.featuredListingIds.filter(fid => fid !== id)
        : [...prev.featuredListingIds, id]
    }));
  };

  const tabs: Array<{ id: "hero" | "featured" | "why-sell" | "why-buy" | "how-it-works" | "pricing" | "testimonials" | "cta"; label: string; icon: typeof Layout }> = [
    { id: "hero", label: "Hero Section", icon: Layout },
    { id: "featured", label: "Featured Listings", icon: Eye },
    { id: "why-sell", label: "Why Sell Section", icon: Type },
    { id: "why-buy", label: "Why Buy Section", icon: Type },
    { id: "how-it-works", label: "How It Works", icon: Type },
    { id: "pricing", label: "Pricing", icon: Type },
    { id: "testimonials", label: "Testimonials", icon: Type },
    { id: "cta", label: "CTA Section", icon: Type },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-3xl font-outfit font-black text-gray-900">Content Manager</h1>
        </div>
        <p className="text-gray-500 ml-11">Edit homepage content, featured listings, and site copy.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id 
                ? "bg-[#002D72] text-white shadow-lg shadow-[#002D72]/20" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {saveMessage && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              saveMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {saveMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {saveMessage.text}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              previewMode ? "bg-[#002D72] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#E31837] text-white font-bold rounded-lg hover:bg-[#c41530] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === "hero" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hero Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={content.hero.badge}
                    onChange={(e) => updateHero("badge", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                    placeholder="e.g. Exclusively Shelby"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Headline</label>
                  <textarea
                    value={content.hero.headline}
                    onChange={(e) => updateHero("headline", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                    placeholder="Main headline text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subheadline</label>
                  <textarea
                    value={content.hero.subheadline}
                    onChange={(e) => updateHero("subheadline", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                    placeholder="Supporting text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Search Placeholder</label>
                  <input
                    type="text"
                    value={content.hero.searchPlaceholder}
                    onChange={(e) => updateHero("searchPlaceholder", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    value={content.hero.ctaText}
                    onChange={(e) => updateHero("ctaText", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={content.hero.heroImage}
                      onChange={(e) => updateHero("heroImage", e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                      placeholder="Image URL or upload below"
                    />
                    <label className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer flex items-center">
                      {uploadingHero ? (
                        <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-600" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'hero')}
                        disabled={uploadingHero}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image or paste a URL</p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preview</h3>
                <div className="relative h-[400px] rounded-xl overflow-hidden">
                  <img 
                    src={content.hero.heroImage} 
                    alt="Hero Preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <span className="inline-flex items-center px-3 py-1 bg-[#E31837]/20 border border-[#E31837]/30 rounded-full backdrop-blur-md mb-4 self-start">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{content.hero.badge}</span>
                    </span>
                    <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight tracking-tighter mb-2 drop-shadow-lg italic uppercase">
                      {content.hero.headline}
                    </h1>
                    <p className="text-[#D1D5DB] font-outfit text-base max-w-md mb-4">
                      {content.hero.subheadline}
                    </p>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/20">
                      <Search className="w-5 h-5 text-white/60" />
                      <span className="text-white/60 text-sm">{content.hero.searchPlaceholder}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "featured" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Featured Listings</h2>
            <p className="text-gray-500 mb-6">Select which listings appear on the homepage. Choose up to 4 listings.</p>

            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No active listings found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => {
                  const isSelected = content.featuredListingIds.includes(listing.id);
                  return (
                    <div
                      key={listing.id}
                      onClick={() => toggleFeaturedListing(listing.id)}
                      className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        isSelected 
                          ? "border-[#002D72] shadow-lg shadow-[#002D72]/20" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="relative h-40">
                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-[#002D72] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{listing.title}</h3>
                        <p className="text-[#E31837] font-bold">${listing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Selected:</strong> {content.featuredListingIds.length} listings (max 4 recommended)
              </p>
            </div>
          </div>
        )}

        {activeTab === "why-sell" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Sell With Us Section</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.whySellTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, whySellTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Subtitle</label>
                <textarea
                  value={content.whySellSubtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, whySellSubtitle: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Reasons</h3>
            <div className="space-y-6">
              {content.whySellReasons.map((reason, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#E31837] font-black text-sm">{reason.num}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={reason.title}
                        onChange={(e) => updateWhySellReason(index, "title", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={reason.description}
                        onChange={(e) => updateWhySellReason(index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "why-buy" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Buy With Us Section</h2>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.whyBuyTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, whyBuyTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Subtitle</label>
                <textarea
                  value={content.whyBuySubtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, whyBuySubtitle: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Reasons</h3>
            <div className="space-y-6">
              {content.whyBuyReasons.map((reason, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#002D72] font-black text-sm">{reason.num}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={reason.title}
                        onChange={(e) => updateWhyBuyReason(index, "title", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={reason.description}
                        onChange={(e) => updateWhyBuyReason(index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "how-it-works" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works Section</h2>
            <div className="space-y-6">
              {content.howItWorksSteps.map((step, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#E31837] font-black text-sm">{step.step}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Step Label</label>
                      <input type="text" value={step.step} onChange={(e) => setContent(prev => ({ ...prev, howItWorksSteps: prev.howItWorksSteps.map((s, i) => i === index ? { ...s, step: e.target.value } : s) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Icon (upload/megaphone/coins)</label>
                      <input type="text" value={step.icon} onChange={(e) => setContent(prev => ({ ...prev, howItWorksSteps: prev.howItWorksSteps.map((s, i) => i === index ? { ...s, icon: e.target.value } : s) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                      <input type="text" value={step.title} onChange={(e) => setContent(prev => ({ ...prev, howItWorksSteps: prev.howItWorksSteps.map((s, i) => i === index ? { ...s, title: e.target.value } : s) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea value={step.description} onChange={(e) => setContent(prev => ({ ...prev, howItWorksSteps: prev.howItWorksSteps.map((s, i) => i === index ? { ...s, description: e.target.value } : s) }))} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing Tiers</h2>
            <div className="space-y-6">
              {content.pricingTiers.map((tier, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`font-black text-sm ${tier.popular ? 'text-[#002D72]' : 'text-gray-500'}`}>{tier.name}</span>
                    {tier.popular && <span className="px-2 py-0.5 bg-[#E31837] text-white text-[10px] font-bold rounded-full">Popular</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                      <input type="text" value={tier.name} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, name: e.target.value } : t) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                      <input type="text" value={tier.price} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, price: e.target.value } : t) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <input type="text" value={tier.description} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, description: e.target.value } : t) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Features (one per line)</label>
                      <textarea value={tier.features.join('\n')} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, features: e.target.value.split('\n').filter(f => f.trim()) } : t) }))} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">CTA Button Text</label>
                      <input type="text" value={tier.cta} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, cta: e.target.value } : t) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={tier.popular} onChange={(e) => setContent(prev => ({ ...prev, pricingTiers: prev.pricingTiers.map((t, i) => i === index ? { ...t, popular: e.target.checked } : t) }))} className="w-5 h-5 text-[#002D72] rounded focus:ring-[#002D72]" />
                        <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "testimonials" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Testimonials</h2>
            <div className="space-y-6">
              {content.testimonials.map((t, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#E31837] font-black text-sm">#{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                      <input type="text" value={t.name} onChange={(e) => setContent(prev => ({ ...prev, testimonials: prev.testimonials.map((x, i) => i === index ? { ...x, name: e.target.value } : x) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <input type="text" value={t.location} onChange={(e) => setContent(prev => ({ ...prev, testimonials: prev.testimonials.map((x, i) => i === index ? { ...x, location: e.target.value } : x) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quote</label>
                      <textarea value={t.text} onChange={(e) => setContent(prev => ({ ...prev, testimonials: prev.testimonials.map((x, i) => i === index ? { ...x, text: e.target.value } : x) }))} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating (1-5)</label>
                      <input type="number" min="1" max="5" value={t.rating} onChange={(e) => setContent(prev => ({ ...prev, testimonials: prev.testimonials.map((x, i) => i === index ? { ...x, rating: parseInt(e.target.value) } : x) }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cta" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Call-to-Action Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <textarea
                    value={content.ctaTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, ctaTitle: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none font-black uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={content.ctaSubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, ctaSubtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Background Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={content.ctaImage}
                      onChange={(e) => setContent(prev => ({ ...prev, ctaImage: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                      placeholder="Image URL or upload below"
                    />
                    <label className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer flex items-center">
                      {uploadingCta ? (
                        <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-600" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cta')}
                        disabled={uploadingCta}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image or paste a URL</p>
                </div>
              </div>

              <div className="bg-[#001530] rounded-xl p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#E31837] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <span className="text-sm font-black text-white/60 uppercase tracking-[4px]">Ready to Ride?</span>
                </div>
                <h2 className="text-white font-outfit font-black text-2xl md:text-3xl leading-tight uppercase tracking-tighter mb-6">
                  {content.ctaTitle}
                </h2>
                <p className="text-[#9CA3AF] font-outfit text-base mb-8">
                  {content.ctaSubtitle}
                </p>
                <div className="relative h-48 rounded-xl overflow-hidden border-4 border-white/10">
                  <img src={content.ctaImage} alt="CTA Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
