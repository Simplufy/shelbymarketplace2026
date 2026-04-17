import Link from "next/link";
import { 
  Search, Heart, ArrowRight, Calendar, Gauge, Zap, ExternalLink, CheckCircle2, Star, Upload, Megaphone, HandCoins
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { trackKlaviyoEvent } from "@/lib/klaviyo/server";
import { KlaviyoInlineForm } from "@/components/KlaviyoInlineForm";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const revalidate = 0;

type WhySellReason = { num: string; title: string; description: string };
type CmsRow = {
  key: "hero" | "featured_listings" | "why_sell" | "why_buy" | "cta" | "testimonials" | "how_it_works" | "pricing";
  value: unknown;
};

type DbTestimonial = {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
};

type ActiveListing = {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  transmission: string;
  primary_image_url: string | null;
  is_featured: boolean;
  status: string;
  listing_tags?: { type: string; number?: number }[];
};

const defaultCmsContent = {
  hero: {
    badge: "Exclusively Shelby",
    headline: "The Fastest Way to Buy or Sell a Ford Shelby",
    subheadline: "The world's premier marketplace for authentic Shelby engineering.",
    heroImage: "/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg",
    searchPlaceholder: "Search by Model, Year, or ZIP...",
    ctaText: "Search Inventory",
  },
  featuredListingIds: [] as string[],
  whySellTitle: "Sell Your Shelby Without Dealer Games",
  whySellSubtitle:
    "Join thousands of satisfied sellers who trust our platform to connect with serious Shelby buyers worldwide.",
  whySellReasons: [
    {
      num: "01",
      title: "Verified Listings",
      description:
        "Every listing undergoes our rigorous verification process. Buyers trust our platform because they know each vehicle has been authenticated, ensuring you connect with serious, qualified buyers who are ready to purchase.",
    },
    {
      num: "02",
      title: "Shelby Customers Look for Us",
      description:
        "Our marketplace is the first destination for Shelby enthusiasts worldwide. When collectors and enthusiasts search for their next performance vehicle, they come to Shelby Exchange first-putting your listing in front of the right audience.",
    },
    {
      num: "03",
      title: "No Transaction Fees",
      description:
        "Keep more of your money. Unlike other marketplaces that charge hefty commissions on every sale, we offer zero transaction fees. You only pay a simple listing fee or choose our subscription model for unlimited listings.",
    },
    {
      num: "04",
      title: "Dealer Discounted Rates",
      description:
        "Professional dealers benefit from our exclusive subscription plans with significant savings. Our Enthusiast and Apex packages offer unlimited listings, priority placement, and dedicated support at rates designed to maximize your ROI.",
    },
  ] as WhySellReason[],
  whyBuyTitle: "Why Buy With Shelby Exchange?",
  whyBuySubtitle:
    "Find verified Shelby inventory faster with transparent details, trusted sellers, and enthusiast-focused search tools.",
  whyBuyReasons: [
    {
      num: "01",
      title: "Verified Shelby Inventory",
      description:
        "Every listing undergoes our rigorous authenticity review before going live. You can browse with confidence knowing each vehicle has been vetted, so you never waste time on questionable listings or misrepresented builds.",
    },
    {
      num: "02",
      title: "Real Market Pricing",
      description:
        "Compare active Shelby listings side by side and quickly identify fair-market value for your target model. No guesswork, no inflated dealer markups—just transparent pricing from real sellers in the market right now.",
    },
    {
      num: "03",
      title: "Direct Seller Contact",
      description:
        "Message verified sellers instantly and get detailed answers about vehicle history, options, and condition before you commit. No middleman, no delays—just direct communication with the person who knows the car best.",
    },
    {
      num: "04",
      title: "Collector-Focused Search",
      description:
        "Filter by trim, year, transmission, drivetrain, mileage, and location to find the exact Shelby spec you want. Our search tools are built by enthusiasts, for enthusiasts, so every filter matters to real buyers.",
    },
  ] as WhySellReason[],
  ctaTitle: "FIND THE SPEC NOBODY ELSE CAN.",
  ctaSubtitle:
    "Whether you're looking for a track-ready GT350R or a pristine 1960s classic, the Ford Shelby Exchange is your definitive destination.",
  ctaImage: "/images/c5f4c-hi-tech-mustang-front.webp",
};

export const dynamic = 'force-dynamic';

const defaultTestimonials: DbTestimonial[] = [
  { id: "1", name: "Marcus T.", location: "Detroit, MI", text: "Sold my 2020 GT500 in under 2 weeks. Got three serious offers and didn't have to deal with any dealer lowball tactics. The process was seamless.", rating: 5 },
  { id: "2", name: "Sarah K.", location: "Austin, TX", text: "Found a low-mileage GT350R within 50 miles of me. The listing details were accurate and the seller was transparent. Best car buying experience I've ever had.", rating: 5 },
  { id: "3", name: "James R.", location: "Columbus, OH", text: "As a dealer, the subscription model saves me thousands compared to other platforms. The buyers here are serious and already know what they want.", rating: 5 },
  { id: "4", name: "David L.", location: "Phoenix, AZ", text: "I was skeptical at first but Shelby Exchange delivered. Listed my Super Snake and had offers within days. No middleman, no hassle.", rating: 5 },
];

const defaultHowItWorks = [
  { icon: "Upload", step: "01", title: "Submit Your Car", description: "Upload photos and details about your Shelby. Our team reviews every listing to ensure quality." },
  { icon: "Megaphone", step: "02", title: "We Promote It", description: "We push your listing to targeted Shelby buyers through our network, social channels, and email subscribers." },
  { icon: "HandCoins", step: "03", title: "You Get Offers", description: "Deal directly with serious buyers. No dealer games, no lowball tactics—just real offers from real enthusiasts." },
];

const defaultPricingTiers = [
  { name: "Standard Listing", price: "$99", description: "Standard search grid visibility.", features: ["Up to 20 High-Res Photos", "VIN Decoding", "Standard Placement"], cta: "Select", popular: false },
  { name: "Homepage Featured", price: "$149", description: "Gets you on the homepage.", features: ["Featured Badge", "Homepage Carousel Placement", "Priority Search Highlighting"], cta: "Select", popular: true },
  { name: "Homepage + Google Ads", price: "$299", description: "Maximum exposure globally.", features: ["Homepage Carousel Placement", "Dedicated Google Ads Campaign", "Social Media Spotlight"], cta: "Select", popular: false },
];

const iconMap: Record<string, typeof Upload> = { Upload, Megaphone, HandCoins };

export default async function Home() {
  const supabase = await createClient();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const cmsReader =
    supabaseUrl && serviceKey
      ? createAdminClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

  const cmsContent = { ...defaultCmsContent };
  const { data: cmsRows, error: cmsError } = await cmsReader
    .from("site_content")
    .select("key, value")
    .eq("section", "homepage")
    .order("updated_at", { ascending: false })
    .in("key", ["hero", "featured_listings", "why_sell", "why_buy", "cta", "testimonials", "how_it_works", "pricing"]);

  if (cmsError) {
    console.error("Homepage CMS load failed:", cmsError.message);
  }

  if (cmsRows && cmsRows.length > 0) {
    const seenKeys = new Set<string>();
    for (const row of cmsRows as CmsRow[]) {
      if (seenKeys.has(row.key)) continue;
      seenKeys.add(row.key);

      if (row.key === "hero" && row.value) {
        cmsContent.hero = { ...cmsContent.hero, ...(row.value as Record<string, string>) };
      }
      if (row.key === "featured_listings" && Array.isArray(row.value)) {
        cmsContent.featuredListingIds = row.value as string[];
      }
      if (row.key === "why_sell" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whySellTitle = val.title || cmsContent.whySellTitle;
        cmsContent.whySellSubtitle = val.subtitle || cmsContent.whySellSubtitle;
        cmsContent.whySellReasons = Array.isArray(val.reasons) && val.reasons.length > 0 ? val.reasons : cmsContent.whySellReasons;
      }
      if (row.key === "why_buy" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whyBuyTitle = val.title || cmsContent.whyBuyTitle;
        cmsContent.whyBuySubtitle = val.subtitle || cmsContent.whyBuySubtitle;
        cmsContent.whyBuyReasons = Array.isArray(val.reasons) && val.reasons.length > 0 ? val.reasons : cmsContent.whyBuyReasons;
      }
      if (row.key === "cta" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; image?: string };
        cmsContent.ctaTitle = val.title || cmsContent.ctaTitle;
        cmsContent.ctaSubtitle = val.subtitle || cmsContent.ctaSubtitle;
        cmsContent.ctaImage = val.image || cmsContent.ctaImage;
      }
    }
  }

  if (!cmsRows || cmsRows.length === 0) {
    const { data: mirroredRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["homepage_hero", "homepage_featured_listings", "homepage_why_sell", "homepage_why_buy", "homepage_cta"]);

    for (const row of mirroredRows || []) {
      if (row.key === "homepage_hero" && row.value) cmsContent.hero = { ...cmsContent.hero, ...(row.value as Record<string, string>) };
      if (row.key === "homepage_featured_listings" && Array.isArray(row.value)) cmsContent.featuredListingIds = row.value as string[];
      if (row.key === "homepage_why_sell" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whySellTitle = val.title || cmsContent.whySellTitle;
        cmsContent.whySellSubtitle = val.subtitle || cmsContent.whySellSubtitle;
        cmsContent.whySellReasons = Array.isArray(val.reasons) && val.reasons.length > 0 ? val.reasons : cmsContent.whySellReasons;
      }
      if (row.key === "homepage_why_buy" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whyBuyTitle = val.title || cmsContent.whyBuyTitle;
        cmsContent.whyBuySubtitle = val.subtitle || cmsContent.whyBuySubtitle;
        cmsContent.whyBuyReasons = Array.isArray(val.reasons) && val.reasons.length > 0 ? val.reasons : cmsContent.whyBuyReasons;
      }
      if (row.key === "homepage_cta" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; image?: string };
        cmsContent.ctaTitle = val.title || cmsContent.ctaTitle;
        cmsContent.ctaSubtitle = val.subtitle || cmsContent.ctaSubtitle;
        cmsContent.ctaImage = val.image || cmsContent.ctaImage;
      }
    }
  }

  let featuredListings: ActiveListing[] = [];
  try {
    const { data: listings, error: listErr } = await supabase.from("listings").select("*").eq("is_featured", true).limit(4);
    if (!listErr && listings && listings.length > 0) {
      const activeListings = listings.filter(l => l.status === 'ACTIVE');
      if (activeListings.length > 0) {
        const listingIds = activeListings.map(l => l.id);
        const { data: images } = await supabase.from("listing_images").select("listing_id, url").eq("is_primary", true).in("listing_id", listingIds);
        const imageByListingId = new Map((images || []).map(img => [img.listing_id, img.url]));
        featuredListings = activeListings.map(listing => ({ ...listing, primary_image_url: imageByListingId.get(listing.id) || null }));
      }
    }
  } catch (err) { console.error('Featured fetch error:', err); }

  let soldListings: ActiveListing[] = [];
  try {
    const { data: soldData, error: soldErr } = await supabase.from("listings").select("*").eq("status", "SOLD").order("sold_at", { ascending: false }).limit(4);
    if (!soldErr && soldData && soldData.length > 0) {
      const listingIds = soldData.map(l => l.id);
      const { data: images } = await supabase.from("listing_images").select("listing_id, url").eq("is_primary", true).in("listing_id", listingIds);
      const imageByListingId = new Map((images || []).map(img => [img.listing_id, img.url]));
      soldListings = soldData.map(listing => ({ ...listing, primary_image_url: imageByListingId.get(listing.id) || null }));
    }
  } catch (err) { console.error('Sold fetch error:', err); }

  let dbTestimonials: DbTestimonial[] = [];
  try {
    const { data: tData } = await supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order", { ascending: true }).limit(20);
    if (tData && tData.length > 0) dbTestimonials = tData;
  } catch (err) { console.error('Testimonials fetch error:', err); }
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : defaultTestimonials;

  let howItWorksSteps = defaultHowItWorks;
  let pricingTiers = defaultPricingTiers;

  try {
    const { count } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "ACTIVE");
    const activeInventoryCount = count || 0;
    await trackKlaviyoEvent({ metricName: "Inventory Snapshot", profile: { external_id: "system_inventory" }, properties: { active_inventory_count: activeInventoryCount } });
    if (activeInventoryCount <= 12) {
      await trackKlaviyoEvent({ metricName: "Low Inventory Alert", profile: { external_id: "system_inventory" }, properties: { active_inventory_count: activeInventoryCount, headline: `Only ${activeInventoryCount} Shelbys available right now` } });
    }
  } catch (err) { console.error("Failed to send inventory events:", err); }

  const { data: rawNewsItems } = await cmsReader.from('news_articles').select('*').order('created_at', { ascending: false }).limit(20);
  const latestNews = [...(rawNewsItems || [])].filter((item: any) => String(item.status || '').toLowerCase() === 'published').sort((a: any, b: any) => {
    const aTime = new Date(a.published_at || a.created_at || 0).getTime();
    const bTime = new Date(b.published_at || b.created_at || 0).getTime();
    return bTime - aTime;
  }).slice(0, 3);
  const mainArticle = latestNews[0] || null;
  const sideArticles = latestNews.slice(1, 3);

  const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  return (
    <div className="flex flex-col font-inter text-[#171a1f] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[580px] md:h-[70vh] md:min-h-[560px] bg-[#0F172A] overflow-hidden">
        <img src={cmsContent.hero.heroImage} className="absolute inset-0 w-full h-full object-cover object-center" alt="Hero" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-12 h-full pt-10 md:pt-28 pb-16 md:pb-6 flex flex-col justify-center">
          <div className="inline-flex items-center px-3 py-1 bg-[#E31837]/20 border border-[#E31837]/30 rounded-full backdrop-blur-md mb-3 self-start">
            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">{cmsContent.hero.badge}</span>
          </div>
          <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl lg:text-[64px] leading-tight tracking-tighter mb-2 drop-shadow-2xl break-words italic uppercase max-w-4xl">{cmsContent.hero.headline}</h1>
          <p className="text-[#D1D5DB] font-outfit text-sm sm:text-lg max-w-lg mb-4">{cmsContent.hero.subheadline}</p>
          <form action="/listings" method="GET" className="glass-search max-w-3xl w-full mx-auto rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 w-full bg-white/90 rounded-lg md:rounded-xl py-2.5 md:py-3">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-[#565d6d] shrink-0" />
              <input type="text" name="search" placeholder={cmsContent.hero.searchPlaceholder} className="bg-transparent border-none outline-none w-full text-xs sm:text-sm font-medium placeholder:text-[#565d6d]/50 min-w-0" />
            </div>
            <button type="submit" className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-[#E31837] text-white text-sm font-black rounded-lg md:rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">{cmsContent.hero.ctaText}</button>
          </form>
          <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5 md:gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#E31837] shrink-0" /><span className="text-white/90 text-xs md:text-sm font-semibold">Verified Listings</span></div>
            <div className="flex items-center gap-1.5 md:gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#E31837] shrink-0" /><span className="text-white/90 text-xs md:text-sm font-semibold">No Dealer Fees</span></div>
            <div className="flex items-center gap-1.5 md:gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#E31837] shrink-0" /><span className="text-white/90 text-xs md:text-sm font-semibold">Secure Transactions</span></div>
            <div className="flex items-center gap-1.5 md:gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#E31837] shrink-0" /><span className="text-white/90 text-xs md:text-sm font-semibold">Nationwide Buyers</span></div>
          </div>
        </div>
      </section>

      {/* Quick Discovery */}
      <section className="bg-[#fafafb] border-b border-[#dee1e6] py-6 md:py-8">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-5 md:px-12 flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-[10px] font-black uppercase tracking-[2px] text-[#565d6d] whitespace-nowrap">Quick Discovery</span>
            <div className="flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar w-full pb-2 md:pb-0">
              {['GT500', 'GT350 & GT350R', 'Super Snake', 'Cobra Jet', 'Classic Shelby (1965-70)', 'Performance Trucks'].map((tag) => (
                <Link key={tag} href="/listings" className="px-4 md:px-6 py-1.5 md:py-2 bg-white border border-[#dee1e6] rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap hover:border-[#002D72] hover:text-[#002D72] transition-colors">{tag}</Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Listings */}
      <section className="py-12 md:py-20 px-5 md:px-12 max-w-[1440px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
            <div>
              <h2 className="text-2xl md:text-[30px] font-extrabold tracking-tight mb-1 md:mb-2">Featured Shelby Listings</h2>
              <p className="text-[#565d6d] text-sm md:text-lg">Vetted high-performance Shelby vehicles from Dealers and Private Sellers nationwide.</p>
            </div>
            <Link href="/featured" className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-2.5 border border-[#dee1e6] rounded-md text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors shrink-0">Explore All Featured <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
          </div>
        </ScrollReveal>
        {featuredListings && featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredListings.map((car) => (
              <Link key={car.id} href={`/listings/${car.id}`} className="card-shadow bg-white rounded-xl border border-[#dee1e6] overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-44 md:h-48 overflow-hidden">
                  <img src={car.primary_image_url || '/images/logo.png'} className="w-full h-full object-cover" alt={`${car.year} ${car.make} ${car.model}`} />
                  {car.is_featured && <div className="absolute top-3 left-3 px-2 md:px-3 py-0.5 md:py-1 bg-[#E31837] text-white text-[9px] md:text-[10px] font-bold rounded-full">FEATURED</div>}
                  {car.listing_tags && Array.isArray(car.listing_tags) && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {car.listing_tags.map((tag: any, tIdx: number) => (
                        <div key={tIdx} className={`px-2 md:px-3 py-0.5 md:py-1 text-white text-[9px] md:text-[10px] font-bold rounded-full ${tag.type === 'Just Listed' ? 'bg-[#002D72]' : tag.type === 'Rare Spec' ? 'bg-purple-600' : 'bg-[#E31837]'}`}>
                          {tag.type === '1 of #__' && tag.number ? `1 of ${tag.number}` : tag.type}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="absolute top-3 right-3 p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"><Heart className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <h3 className="font-outfit text-base md:text-xl font-bold mb-1 md:mb-2 line-clamp-1">{car.year} {car.make} {car.model}</h3>
                  <span className="text-[#E31837] font-outfit text-lg md:text-2xl font-black mb-4 md:mb-6">{formatPrice(car.price)}</span>
                  <div className="grid grid-cols-3 border-y border-[#f3f4f6] py-3 md:py-4 mb-4 md:mb-6">
                    <div className="text-center border-r border-[#f3f4f6]"><Calendar className="w-3 h-3 md:w-4 md:h-4 mx-auto mb-0.5 md:mb-1 text-[#565d6d]" /><span className="block text-[9px] md:text-[10px] font-bold text-[#565d6d] uppercase">Year</span><span className="text-[10px] md:text-xs font-semibold">{car.year}</span></div>
                    <div className="text-center border-r border-[#f3f4f6]"><Gauge className="w-3 h-3 md:w-4 md:h-4 mx-auto mb-0.5 md:mb-1 text-[#565d6d]" /><span className="block text-[9px] md:text-[10px] font-bold text-[#565d6d] uppercase">Miles</span><span className="text-[10px] md:text-xs font-semibold">{(car.mileage / 1000).toFixed(0)}k</span></div>
                    <div className="text-center"><Zap className="w-3 h-3 md:w-4 md:h-4 mx-auto mb-0.5 md:mb-1 text-[#565d6d]" /><span className="block text-[9px] md:text-[10px] font-bold text-[#565d6d] uppercase">Trans</span><span className="text-[10px] md:text-xs font-semibold">{car.transmission === 'Automatic' ? 'Auto' : 'Man'}</span></div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <span className="flex-1 bg-[#002D72] text-white text-[10px] md:text-xs font-bold py-2.5 md:py-3 rounded-md text-center hover:bg-[#001D4A] transition-colors">Check Availability</span>
                    <span className="p-2 md:p-3 border border-[#dee1e6] rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"><ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-[#565d6d]">No featured listings available at the moment.</p><Link href="/listings" className="mt-4 inline-block text-[#002D72] font-bold">View All Listings →</Link></div>
        )}
      </section>

      {/* Recently Sold */}
      {soldListings.length > 0 && (
        <section className="py-12 md:py-16 px-5 md:px-12 max-w-[1440px] mx-auto border-b border-[#dee1e6]">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4 md:gap-6">
              <div><h2 className="text-xl md:text-[28px] font-extrabold tracking-tight mb-1 md:mb-2">Recently Sold</h2><p className="text-[#565d6d] text-sm md:text-base">See what Shelby vehicles are selling for in today&apos;s market.</p></div>
              <Link href="/listings" className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 border border-[#dee1e6] rounded-md text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors shrink-0">View Active Listings <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {soldListings.map((car) => (
              <div key={car.id} className="bg-white rounded-xl border border-[#dee1e6] overflow-hidden flex flex-col opacity-75">
                <div className="relative h-40 md:h-44 overflow-hidden">
                  <img src={car.primary_image_url || '/images/logo.png'} className="w-full h-full object-cover grayscale" alt={`${car.year} ${car.make} ${car.model}`} />
                  <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 px-2 md:px-3 py-0.5 md:py-1 bg-[#171a1f] text-white text-[9px] md:text-[10px] font-bold rounded-full">SOLD</div>
                </div>
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="font-outfit text-sm md:text-base font-bold mb-1 line-clamp-1">{car.year} {car.make} {car.model}</h3>
                  <span className="text-[#565d6d] font-outfit text-base md:text-lg font-black mb-2 md:mb-3">{formatPrice(car.price)}</span>
                  <div className="flex gap-3 md:gap-4 text-[10px] md:text-xs text-[#565d6d]"><span>{car.mileage ? `${(car.mileage / 1000).toFixed(0)}k mi` : 'N/A'}</span><span>{car.transmission === 'Automatic' ? 'Auto' : 'Manual'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#fafafb] py-16 md:py-20 px-5 md:px-12 border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#E31837]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#E31837] uppercase tracking-wider">Simple 3-Step Process</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 md:mb-4">How It Works</h2>
              <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">Selling your Shelby has never been easier. Three simple steps to connect with serious buyers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {howItWorksSteps.map((step, idx) => {
                const Icon = iconMap[step.icon] || Upload;
                return (
                  <div key={idx} className="relative bg-white rounded-2xl p-6 md:p-8 border border-[#dee1e6] shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E31837]/10 rounded-xl flex items-center justify-center mb-4 md:mb-6"><Icon className="w-6 h-6 md:w-7 md:h-7 text-[#E31837]" /></div>
                    <span className="text-[#E31837] font-black text-xs tracking-wider mb-2 block">{step.step}</span>
                    <h3 className="font-outfit font-bold text-lg md:text-xl mb-2 md:mb-3">{step.title}</h3>
                    <p className="text-[#565d6d] text-sm leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 md:mt-12 text-center"><Link href="/sell" className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-[#E31837] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">Start Selling Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /></Link></div>
          </div>
        </ScrollReveal>
      </section>

      {/* Testimonials - Auto-scrolling */}
      <section id="testimonials" className="bg-[#fafafb] py-16 md:py-20 overflow-hidden border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-5 md:px-12">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#E31837]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#E31837] uppercase tracking-wider">Testimonials</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 md:mb-4">What Our Community Says</h2>
              <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">Real stories from real Shelby enthusiasts who bought and sold on our platform.</p>
            </div>
          </div>
        </ScrollReveal>
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-testimonials gap-4 md:gap-6 w-max">
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 md:p-6 border border-[#dee1e6] shadow-sm flex flex-col w-[280px] md:w-[320px] shrink-0">
                <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#E31837] text-[#E31837]" />))}</div>
                <p className="text-[#565d6d] text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-1">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#f3f4f6]">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#002D72]/10 rounded-full flex items-center justify-center"><span className="text-[#002D72] font-bold text-xs md:text-sm">{testimonial.name[0]}</span></div>
                  <div><span className="block text-xs md:text-sm font-bold text-[#171a1f]">{testimonial.name}</span><span className="block text-[10px] md:text-xs text-[#565d6d]">{testimonial.location}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listing Pricing */}
      <section className="bg-white py-16 md:py-20 px-5 md:px-12">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#002D72]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#002D72] uppercase tracking-wider">Transparent Pricing</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 md:mb-4">Listing Packages</h2>
              <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">Choose the package that fits your needs. No hidden fees, no transaction commissions.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {pricingTiers.map((tier, idx) => (
                <div key={idx} className={`relative rounded-2xl p-6 md:p-8 border ${tier.popular ? 'border-[#002D72] shadow-lg bg-[#f8faff]' : 'border-[#dee1e6] bg-white'} flex flex-col`}>
                  {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 bg-[#E31837] text-white text-[9px] md:text-[10px] font-bold rounded-full uppercase tracking-wider">Recommended</div>}
                  <h3 className="font-outfit font-bold text-base md:text-lg mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1"><span className="text-3xl md:text-4xl font-black text-[#002D72]">{tier.price}</span></div>
                  <p className="text-[#565d6d] text-xs md:text-sm mb-4 md:mb-6">{tier.description}</p>
                  <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 flex-1">
                    {tier.features.map((feature, fIdx) => (<li key={fIdx} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[#171a1f]"><CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 shrink-0 mt-0.5" />{feature}</li>))}
                  </ul>
                  <Link href={tier.name === "Standard Listing" ? "/sell/wizard?package=STANDARD" : tier.name === "Homepage Featured" ? "/sell/wizard?package=HOMEPAGE" : "/sell/wizard?package=HOMEPAGE_PLUS_ADS"} className={`w-full py-2.5 md:py-3 rounded-lg text-center text-xs md:text-sm font-bold transition-colors ${tier.popular ? 'bg-[#002D72] text-white hover:bg-[#001D4A]' : 'bg-[#f3f4f6] text-[#171a1f] hover:bg-[#e5e7eb]'}`}>{tier.cta}</Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Why Sell */}
      <section className="bg-white py-16 md:py-24 px-5 md:px-12 border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#E31837]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#E31837] uppercase tracking-wider">For Sellers</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-4 md:mb-6">Sell Your Shelby Without Dealer Games</h2>
              <div className="flex flex-col items-center">
                <div className="flex flex-col gap-3 md:gap-6 items-start">
                  <div className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#E31837] shrink-0" /><span className="text-xs md:text-sm font-bold text-[#171a1f]">Reach Nationwide Buyers</span></div>
                  <div className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#E31837] shrink-0" /><span className="text-xs md:text-sm font-bold text-[#171a1f]">No Trade-In Loss</span></div>
                  <div className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#E31837] shrink-0" /><span className="text-xs md:text-sm font-bold text-[#171a1f]">You Control Your Price</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-6 md:space-y-8 lg:hidden">
              {cmsContent.whySellReasons.map((reason, idx) => (
                <div key={idx} className="space-y-3 md:space-y-4">
                  <div className="relative h-36 md:h-40 rounded-2xl overflow-hidden group">
                    <img src={['/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg', '/images/2026_supersnaker_gallery_06-938430.jpg', '/images/1967-ford-shelby-gt500-super-snake.avif', '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp'][idx]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={reason.title} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                  </div>
                  <div className="group"><div className="flex items-start gap-3 md:gap-4"><span className="text-[#E31837] font-black text-sm tracking-wider">{reason.num}</span><div><h3 className="font-outfit font-bold text-lg md:text-xl mb-1 md:mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3><p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p></div></div></div>
                </div>
              ))}
            </div>
            <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_2fr] gap-12">
              <div className="space-y-6">{[{ img: '/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg' }, { img: '/images/2026_supersnaker_gallery_06-938430.jpg' }, { img: '/images/1967-ford-shelby-gt500-super-snake.avif' }, { img: '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp' }].map((item, idx) => (<div key={idx} className="relative h-40 rounded-2xl overflow-hidden group"><img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" /><div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" /></div>))}</div>
              <div className="hidden lg:flex flex-col items-center justify-center relative py-8"><div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#E31837]/20 -translate-x-1/2" />{[0,1,2,3].map((i) => (<div key={i} className="relative flex-1 flex items-center justify-center w-full"><div className="relative z-10"><div className="w-4 h-4 bg-[#E31837] rounded-full shadow-lg shadow-[#E31837]/30 animate-pulse" /><div className="absolute inset-0 w-4 h-4 bg-[#E31837] rounded-full animate-ping opacity-75" /></div></div>))}</div>
              <div className="flex flex-col justify-center space-y-8">{cmsContent.whySellReasons.map((reason, idx) => (<div key={idx} className="group"><div className="flex items-start gap-4"><span className="text-[#E31837] font-black text-sm tracking-wider">{reason.num}</span><div><h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3><p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p></div></div></div>))}</div>
            </div>
            <div className="mt-10 md:mt-16 text-center"><Link href="/sell" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-[#002D72] text-white text-sm font-black rounded-xl shadow-lg shadow-[#002D72]/20 hover:bg-[#001D4A] transition-colors">Start Selling Today <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /></Link></div>
          </div>
        </ScrollReveal>
      </section>

      {/* Why Buy */}
      <section className="bg-white py-16 md:py-24 px-5 md:px-12 border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#002D72]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#002D72] uppercase tracking-wider">For Buyers</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 md:mb-4">{cmsContent.whyBuyTitle}</h2>
              <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">{cmsContent.whyBuySubtitle}</p>
            </div>
            <div className="space-y-6 md:space-y-8 lg:hidden">
              {cmsContent.whyBuyReasons.map((reason, idx) => (
                <div key={idx} className="space-y-3 md:space-y-4">
                  <div className="relative h-36 md:h-40 rounded-2xl overflow-hidden group">
                    <img src={['/images/1967-ford-shelby-gt500-super-snake.avif', '/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg', '/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif', '/images/2026_supersnaker_gallery_06-938430.jpg'][idx]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={reason.title} />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                  </div>
                  <div className="group"><div className="flex items-start gap-3 md:gap-4"><span className="text-[#002D72] font-black text-sm tracking-wider">{reason.num}</span><div><h3 className="font-outfit font-bold text-lg md:text-xl mb-1 md:mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3><p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p></div></div></div>
                </div>
              ))}
            </div>
            <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_2fr] gap-12">
              <div className="flex flex-col justify-center space-y-8 lg:order-1">{cmsContent.whyBuyReasons.map((reason, idx) => (<div key={idx} className="group"><div className="flex items-start gap-4"><span className="text-[#002D72] font-black text-sm tracking-wider">{reason.num}</span><div><h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3><p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p></div></div></div>))}</div>
              <div className="hidden lg:flex flex-col items-center justify-center relative py-8 lg:order-2"><div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#002D72]/20 -translate-x-1/2" />{[0,1,2,3].map((i) => (<div key={i} className="relative flex-1 flex items-center justify-center w-full"><div className="relative z-10"><div className="w-4 h-4 bg-[#002D72] rounded-full shadow-lg shadow-[#002D72]/30 animate-pulse" /><div className="absolute inset-0 w-4 h-4 bg-[#002D72] rounded-full animate-ping opacity-75" /></div></div>))}</div>
              <div className="space-y-6 lg:order-3">{[{ img: '/images/1967-ford-shelby-gt500-super-snake.avif' }, { img: '/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg' }, { img: '/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif' }, { img: '/images/2026_supersnaker_gallery_06-938430.jpg' }].map((item, idx) => (<div key={idx} className="relative h-40 rounded-2xl overflow-hidden group"><img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" /><div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" /></div>))}</div>
            </div>
            <div className="mt-10 md:mt-16 text-center"><Link href="/listings" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-[#002D72] text-white text-sm font-black rounded-xl shadow-lg shadow-[#002D72]/20 hover:bg-[#001D4A] transition-colors">Start Buying Today <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /></Link></div>
          </div>
        </ScrollReveal>
      </section>

      {/* Performance Reports */}
      <section className="py-16 md:py-24 px-5 md:px-12 max-w-[1440px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
            <div><h2 className="text-2xl md:text-[30px] font-extrabold tracking-tight mb-1 md:mb-2">Performance Reports</h2><p className="text-[#565d6d] text-sm md:text-lg">The latest in Shelby history, auction news, and engineering deep-dives.</p></div>
            <Link href="/blog" className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-2.5 border border-[#dee1e6] rounded-md text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors shrink-0">Read All Stories <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7">
            {mainArticle ? (
              <>
                <div className="relative h-[280px] md:h-[430px] rounded-2xl md:rounded-3xl overflow-hidden mb-6 md:mb-8 shadow-lg"><img src={mainArticle.image_url || '/images/logo.png'} className="w-full h-full object-cover" alt={mainArticle.title} /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute top-4 left-4 md:top-6 md:left-6"><span className="px-3 md:px-5 py-1 md:py-1.5 bg-white text-[9px] md:text-[10px] font-black rounded-full uppercase">{mainArticle.category || 'News'}</span></div></div>
                <h3 className="text-xl md:text-2xl lg:text-4xl font-black tracking-tighter mb-3 md:mb-4 leading-tight break-words">{mainArticle.title}</h3>
                <p className="text-[#565d6d] text-sm md:text-lg mb-4 md:mb-6 leading-relaxed">{mainArticle.excerpt || 'Read the latest Shelby insights and market updates.'}</p>
                <div className="flex items-center gap-3 md:gap-4"><span className="text-[10px] md:text-xs font-bold text-[#565d6d] uppercase tracking-widest">{new Date(mainArticle.published_at || mainArticle.created_at).toLocaleDateString()}</span><div className="w-1 h-1 bg-[#dee1e6] rounded-full" /><Link href={`/blog/${mainArticle.slug || mainArticle.id}`} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-extrabold text-[#002D72] uppercase tracking-widest hover:underline">Read Story <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" /></Link></div>
              </>
            ) : (<div className="rounded-2xl md:rounded-3xl border border-[#dee1e6] p-6 md:p-8 bg-gray-50"><h3 className="text-xl md:text-2xl font-black tracking-tight mb-2">Performance reports are coming soon</h3><p className="text-[#565d6d]">Publish an article in Admin → News to feature it here.</p></div>)}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            {sideArticles.map((item: any) => (<Link key={item.id} href={`/blog/${item.slug || item.id}`} className="flex gap-4 md:gap-6 group cursor-pointer"><div className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden shrink-0 shadow-sm"><img src={item.image_url || '/images/logo.png'} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.title} /></div><div className="flex flex-col justify-center"><div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2"><span className="text-[8px] md:text-[9px] font-black text-[#E31837] uppercase tracking-widest">{item.category}</span><span className="text-[8px] md:text-[9px] font-bold text-[#565d6d] uppercase tracking-widest">{new Date(item.published_at).toLocaleDateString()}</span></div><h4 className="font-outfit font-bold text-sm md:text-lg leading-snug group-hover:text-[#002D72] transition-colors">{item.title}</h4></div></Link>))}
            <div className="mt-2 md:mt-4 p-6 md:p-8 bg-[#002D72]/5 rounded-2xl md:rounded-3xl border border-[#002D72]/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6"><div><h4 className="font-outfit font-bold text-base md:text-lg mb-1">The Shelby Weekly</h4><p className="text-[10px] md:text-xs text-[#565d6d]">Auction alerts and performance reviews.</p></div><button className="px-6 md:px-8 py-2 md:py-2.5 bg-[#002D72] text-white text-xs md:text-sm font-bold rounded-md hover:bg-[#001D4A] transition-colors">Subscribe</button></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 px-5 md:px-12 max-w-[1440px] mx-auto w-full">
        <ScrollReveal>
          <KlaviyoInlineForm title="Get Weekly Shelby Deals & Listings" description="Be first to hear about hot listings, price drops, and collector opportunities." source="homepage_inline" />
        </ScrollReveal>
      </section>

      <section className="relative bg-[#001530] py-20 md:py-32 overflow-hidden">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-5 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center relative z-10">
            <div className="relative group order-1 lg:order-2"><div className="absolute -inset-1 bg-white/10 rounded-[24px] md:rounded-[32px] blur-xl group-hover:bg-[#E31837]/20 transition-all duration-500" /><div className="relative h-[240px] md:h-[300px] lg:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl"><img src={cmsContent.ctaImage} className="w-full h-full object-cover" alt="Dream Shelby" /><div className="absolute inset-0 bg-[#002D72]/20 mix-blend-overlay" /></div></div>
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-12"><div className="w-10 h-10 md:w-12 md:h-12 bg-[#E31837] rounded-full flex items-center justify-center"><span className="text-white font-bold text-lg md:text-xl">S</span></div><span className="text-xs md:text-sm font-black text-white/60 uppercase tracking-[2px] md:tracking-[4px]">Ready to Ride?</span></div>
              <h2 className="text-white font-outfit font-black text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-[0.95] uppercase tracking-tighter mb-4 md:mb-6 lg:mb-10 break-words">{cmsContent.ctaTitle}</h2>
              <p className="text-[#9CA3AF] font-outfit text-base md:text-xl max-w-lg mb-6 md:mb-8 lg:mb-12 leading-relaxed">{cmsContent.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4"><Link href="/listings" className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-[#002D72] text-white text-sm font-black rounded-xl md:rounded-2xl shadow-2xl shadow-[#002D72]/30 hover:bg-[#001D4A] transition-all text-center">Browse All Inventory</Link><Link href="/sell" className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-[#323743] text-sm font-black rounded-xl md:rounded-2xl border border-white/20 hover:bg-gray-100 transition-all text-center">Sell Your Shelby</Link></div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
