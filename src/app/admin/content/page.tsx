"use client";

import { useState, useEffect } from "react";
import { 
  Save, Type, Layout, Eye, ArrowLeft, Upload,
  CheckCircle, AlertCircle, Search, Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

type SiteContent = {
  hero: HeroContent;
  featuredListingIds: string[];
  whySellTitle: string;
  whySellSubtitle: string;
  whySellReasons: WhySellReason[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaImage: string;
};

type ContentRow = {
  key: "hero" | "featured_listings" | "why_sell" | "cta";
  value: unknown;
};

// Default content matching current homepage
const defaultContent: SiteContent = {
  hero: {
    badge: "Exclusively Shelby",
    headline: "The Fastest Way to Buy or Sell a Ford Shelby",
    subheadline: "The world's premier marketplace for authentic Shelby engineering.",
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
      description: "Professional dealers benefit from our exclusive subscription plans with significant savings. Our Enthusiast and Apex packages offer unlimited listings, priority placement, and dedicated support at rates designed to maximize your ROI."
    }
  ],
  ctaTitle: "FIND THE SPEC NOBODY ELSE CAN.",
  ctaSubtitle: "Whether you're looking for a track-ready GT350R or a pristine 1960s classic, the Ford Shelby Exchange is your definitive destination.",
  ctaImage: "/images/c5f4c-hi-tech-mustang-front.webp"
};

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<"hero" | "featured" | "why-sell" | "cta">("hero");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [listings, setListings] = useState<Array<{id: string; title: string; price: number; image: string}>>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCta, setUploadingCta] = useState(false);
  
  const supabase = createClient();
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('site-images')
        .getPublicUrl(fileName);

      if (type === 'hero') {
        updateHero('heroImage', publicUrl);
      } else {
        setContent(prev => ({ ...prev, ctaImage: publicUrl }));
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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Content request timeout")), 8000)
      );

      const queryPromise = supabase
        .from("site_content")
        .select("*")
        .eq("section", "homepage")
        .order("updated_at", { ascending: false })
        .in("key", ["hero", "featured_listings", "why_sell", "cta"]);

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as {
        data: ContentRow[] | null;
        error: { message?: string } | null;
      };

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedContent = { ...defaultContent };
        const seenKeys = new Set<string>();
        
        data.forEach((item) => {
          if (seenKeys.has(item.key)) return;
          seenKeys.add(item.key);

          switch (item.key) {
            case "hero":
              loadedContent.hero = item.value as HeroContent;
              break;
            case "featured_listings":
              loadedContent.featuredListingIds = (item.value as string[]) || [];
              break;
            case "why_sell":
              const whySellData = item.value as { title: string; subtitle: string; reasons: WhySellReason[] };
              loadedContent.whySellTitle = whySellData.title;
              loadedContent.whySellSubtitle = whySellData.subtitle;
              loadedContent.whySellReasons = whySellData.reasons;
              break;
            case "cta":
              const ctaData = item.value as { title: string; subtitle: string; image: string };
              loadedContent.ctaTitle = ctaData.title;
              loadedContent.ctaSubtitle = ctaData.subtitle;
              loadedContent.ctaImage = ctaData.image;
              break;
          }
        });
        
        setContent(loadedContent);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      // Fall back to localStorage
      const saved = localStorage.getItem("shelby_cms_content");
      if (saved) {
        try {
          setContent(JSON.parse(saved));
        } catch {
          console.error("Failed to parse saved content");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from("active_listings")
        .select("id, year, make, model, price, primary_image_url")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setListings(data.map(l => ({
          id: l.id,
          title: `${l.year} ${l.make} ${l.model}`,
          price: l.price,
          image: l.primary_image_url || "/images/logo.png"
        })));
      }
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
        { key: "cta", value: {
          title: content.ctaTitle,
          subtitle: content.ctaSubtitle,
          image: content.ctaImage
        }}
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

  const toggleFeaturedListing = (id: string) => {
    setContent(prev => ({
      ...prev,
      featuredListingIds: prev.featuredListingIds.includes(id)
        ? prev.featuredListingIds.filter(fid => fid !== id)
        : [...prev.featuredListingIds, id]
    }));
  };

  const tabs: Array<{ id: "hero" | "featured" | "why-sell" | "cta"; label: string; icon: typeof Layout }> = [
    { id: "hero", label: "Hero Section", icon: Layout },
    { id: "featured", label: "Featured Listings", icon: Eye },
    { id: "why-sell", label: "Why Sell Section", icon: Type },
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
