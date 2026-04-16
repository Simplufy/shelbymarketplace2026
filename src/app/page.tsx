import Link from "next/link";
import { 
  Search, Heart, ArrowRight, Calendar, Gauge, Zap, ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { trackKlaviyoEvent } from "@/lib/klaviyo/server";
import { KlaviyoInlineForm } from "@/components/KlaviyoInlineForm";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const revalidate = 0;

type WhySellReason = { num: string; title: string; description: string };
type CmsRow = {
  key: "hero" | "featured_listings" | "why_sell" | "why_buy" | "cta";
  value: unknown;
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
  whySellTitle: "Why Sell With Shelby Exchange?",
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

export default async function Home() {
  // Fetch featured listings from database
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

  // Load CMS-managed homepage content
  const cmsContent = { ...defaultCmsContent };
  const { data: cmsRows, error: cmsError } = await cmsReader
    .from("site_content")
    .select("key, value")
    .eq("section", "homepage")
    .order("updated_at", { ascending: false })
    .in("key", ["hero", "featured_listings", "why_sell", "why_buy", "cta"]);

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
        cmsContent.whySellReasons = Array.isArray(val.reasons) && val.reasons.length > 0
          ? val.reasons
          : cmsContent.whySellReasons;
      }
      if (row.key === "why_buy" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whyBuyTitle = val.title || cmsContent.whyBuyTitle;
        cmsContent.whyBuySubtitle = val.subtitle || cmsContent.whyBuySubtitle;
        cmsContent.whyBuyReasons = Array.isArray(val.reasons) && val.reasons.length > 0
          ? val.reasons
          : cmsContent.whyBuyReasons;
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
      .in("key", [
        "homepage_hero",
        "homepage_featured_listings",
        "homepage_why_sell",
        "homepage_why_buy",
        "homepage_cta",
      ]);

    for (const row of mirroredRows || []) {
      if (row.key === "homepage_hero" && row.value) {
        cmsContent.hero = { ...cmsContent.hero, ...(row.value as Record<string, string>) };
      }
      if (row.key === "homepage_featured_listings" && Array.isArray(row.value)) {
        cmsContent.featuredListingIds = row.value as string[];
      }
      if (row.key === "homepage_why_sell" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whySellTitle = val.title || cmsContent.whySellTitle;
        cmsContent.whySellSubtitle = val.subtitle || cmsContent.whySellSubtitle;
        cmsContent.whySellReasons = Array.isArray(val.reasons) && val.reasons.length > 0
          ? val.reasons
          : cmsContent.whySellReasons;
      }
      if (row.key === "homepage_why_buy" && row.value) {
        const val = row.value as { title?: string; subtitle?: string; reasons?: WhySellReason[] };
        cmsContent.whyBuyTitle = val.title || cmsContent.whyBuyTitle;
        cmsContent.whyBuySubtitle = val.subtitle || cmsContent.whyBuySubtitle;
        cmsContent.whyBuyReasons = Array.isArray(val.reasons) && val.reasons.length > 0
          ? val.reasons
          : cmsContent.whyBuyReasons;
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
  
  // Featured listings - query directly from database
  try {
    // First get featured listings
    const { data: listings, error: listErr } = await supabase
      .from("listings")
      .select("*")
      .eq("is_featured", true)
      .limit(4);
    
    if (!listErr && listings && listings.length > 0) {
      const activeListings = listings.filter(l => l.status === 'ACTIVE');
      
      if (activeListings.length > 0) {
        const listingIds = activeListings.map(l => l.id);
        const { data: images } = await supabase
          .from("listing_images")
          .select("listing_id, url")
          .eq("is_primary", true)
          .in("listing_id", listingIds);
        
        const imageByListingId = new Map((images || []).map(img => [img.listing_id, img.url]));
        
        featuredListings = activeListings.map(listing => ({
          ...listing,
          primary_image_url: imageByListingId.get(listing.id) || null
        }));
      }
    }
  } catch (err) {
    console.error('Featured fetch error:', err);
  }

  try {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "ACTIVE");

    const activeInventoryCount = count || 0;

    await trackKlaviyoEvent({
      metricName: "Inventory Snapshot",
      profile: { external_id: "system_inventory" },
      properties: {
        active_inventory_count: activeInventoryCount,
      },
    });

    if (activeInventoryCount <= 12) {
      await trackKlaviyoEvent({
        metricName: "Low Inventory Alert",
        profile: { external_id: "system_inventory" },
        properties: {
          active_inventory_count: activeInventoryCount,
          headline: `Only ${activeInventoryCount} Shelbys available right now`,
        },
      });
    }
  } catch (err) {
    console.error("Failed to send inventory events:", err);
  }

  const { data: rawNewsItems } = await cmsReader
    .from('news_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const latestNews = [...(rawNewsItems || [])]
    .filter((item: any) => String(item.status || '').toLowerCase() === 'published')
    .sort((a: any, b: any) => {
    const aTime = new Date(a.published_at || a.created_at || 0).getTime();
    const bTime = new Date(b.published_at || b.created_at || 0).getTime();
    return bTime - aTime;
  })
    .slice(0, 3);
  const mainArticle = latestNews[0] || null;
  const sideArticles = latestNews.slice(1, 3);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col font-inter text-[#171a1f] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[560px] bg-[#0F172A] overflow-hidden">
        <img src={cmsContent.hero.heroImage} className="absolute inset-0 w-full h-full object-cover object-center" alt="Hero" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-12 h-full pt-24 md:pt-28 pb-6 flex flex-col justify-center">
          <div className="inline-flex items-center px-4 py-1 bg-[#E31837]/20 border border-[#E31837]/30 rounded-full backdrop-blur-md mb-4 self-start">
            <span className="text-xs font-bold text-white uppercase tracking-wider">{cmsContent.hero.badge}</span>
          </div>
          
          <h1 className="text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight tracking-tighter mb-2 drop-shadow-2xl break-words italic uppercase max-w-4xl">
            {cmsContent.hero.headline}
          </h1>
          
          <p className="text-[#D1D5DB] font-outfit text-lg max-w-lg mb-4">
            {cmsContent.hero.subheadline}
          </p>

          <form action="/listings" method="GET" className="glass-search max-w-3xl w-full mx-auto rounded-2xl p-3 flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex-1 flex items-center gap-3 px-4 w-full bg-white/90 rounded-xl py-3">
              <Search className="w-5 h-5 text-[#565d6d]" />
              <input 
                type="text" 
                name="search"
                placeholder={cmsContent.hero.searchPlaceholder}
                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#565d6d]/50 min-w-0" 
              />
            </div>
            <button type="submit" className="w-full md:w-auto px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">
              {cmsContent.hero.ctaText}
            </button>
          </form>
        </div>
      </section>

      {/* Quick Discovery */}
      <section className="bg-[#fafafb] border-b border-[#dee1e6] py-8">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center gap-8">
          <span className="text-[10px] font-black uppercase tracking-[2px] text-[#565d6d] whitespace-nowrap">Quick Discovery</span>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar w-full pb-2 md:pb-0">
            {['GT500', 'GT350 & GT350R', 'Super Snake', 'Cobra Jet', 'Classic Shelby (1965-70)', 'Performance Trucks'].map((tag) => (
              <Link key={tag} href="/listings" className="px-6 py-2 bg-white border border-[#dee1e6] rounded-full text-xs font-bold whitespace-nowrap hover:border-[#002D72] hover:text-[#002D72] transition-colors">
                {tag}
              </Link>
            ))}
          </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-4 md:px-12 max-w-[1440px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-[30px] font-extrabold tracking-tight mb-2">Featured Shelby Listings</h2>
            <p className="text-[#565d6d] text-lg">Vetted high-performance Shelby vehicles from Dealers and Private Sellers nationwide.</p>
          </div>
          <Link href="/featured" className="flex items-center gap-4 px-6 py-2.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Explore All Featured <ArrowRight className="w-4 h-4" />
          </Link>
          </div>
        </ScrollReveal>

        {featuredListings && featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((car) => (
              <Link key={car.id} href={`/listings/${car.id}`} className="card-shadow bg-white rounded-xl border border-[#dee1e6] overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img src={car.primary_image_url || '/images/logo.png'} className="w-full h-full object-cover" alt={`${car.year} ${car.make} ${car.model}`} />
                  {car.is_featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#E31837] text-white text-[10px] font-bold rounded-full">FEATURED</div>
                  )}
                  <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-outfit text-xl font-bold mb-2 line-clamp-1">{car.year} {car.make} {car.model}</h3>
                  <span className="text-[#E31837] font-outfit text-2xl font-black mb-6">{formatPrice(car.price)}</span>
                  <div className="grid grid-cols-3 border-y border-[#f3f4f6] py-4 mb-6">
                    <div className="text-center border-r border-[#f3f4f6]">
                      <Calendar className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                      <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Year</span>
                      <span className="text-xs font-semibold">{car.year}</span>
                    </div>
                    <div className="text-center border-r border-[#f3f4f6]">
                      <Gauge className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                      <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Miles</span>
                      <span className="text-xs font-semibold">{(car.mileage / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-center">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                      <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Trans</span>
                      <span className="text-xs font-semibold">{car.transmission === 'Automatic' ? 'Auto' : 'Man'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <span className="flex-1 bg-[#002D72] text-white text-xs font-bold py-3 rounded-md text-center hover:bg-[#001D4A] transition-colors">Check Availability</span>
                    <span className="p-3 border border-[#dee1e6] rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-[#565d6d]">No featured listings available at the moment.</p>
            <Link href="/listings" className="mt-4 inline-block text-[#002D72] font-bold">View All Listings →</Link>
          </div>
        )}
      </section>

      {/* Why Sell With Shelby Exchange */}
      <section className="bg-white py-24 border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E31837]/10 rounded-full mb-6">
              <span className="text-xs font-bold text-[#E31837] uppercase tracking-wider">For Sellers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{cmsContent.whySellTitle}</h2>
            <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">{cmsContent.whySellSubtitle}</p>
          </div>

          <div className="space-y-8 lg:hidden">
            {cmsContent.whySellReasons.map((reason, idx) => (
              <div key={idx} className="space-y-4">
                <div className="relative h-40 rounded-2xl overflow-hidden group">
                  <img
                    src={[
                      '/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg',
                      '/images/2026_supersnaker_gallery_06-938430.jpg',
                      '/images/1967-ford-shelby-gt500-super-snake.avif',
                      '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp',
                    ][idx]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={reason.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                </div>
                <div className="group">
                  <div className="flex items-start gap-4">
                    <span className="text-[#E31837] font-black text-sm tracking-wider">{reason.num}</span>
                    <div>
                      <h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3>
                      <p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_2fr] gap-12">
            <div className="space-y-6">
              {[
                { img: '/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg', alt: 'GT500 Sale' },
                { img: '/images/2026_supersnaker_gallery_06-938430.jpg', alt: 'Super Snake' },
                { img: '/images/1967-ford-shelby-gt500-super-snake.avif', alt: 'Classic Shelby' },
                { img: '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp', alt: 'Modern Shelby' },
              ].map((item, idx) => (
                <div key={idx} className="relative h-40 rounded-2xl overflow-hidden group">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.alt} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                </div>
              ))}
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center relative py-8">
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#E31837]/20 -translate-x-1/2" />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative flex-1 flex items-center justify-center w-full">
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-[#E31837] rounded-full shadow-lg shadow-[#E31837]/30 animate-pulse" />
                    <div className="absolute inset-0 w-4 h-4 bg-[#E31837] rounded-full animate-ping opacity-75" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center space-y-8">
              {cmsContent.whySellReasons.map((reason, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start gap-4">
                    <span className="text-[#E31837] font-black text-sm tracking-wider">{reason.num}</span>
                    <div>
                      <h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3>
                      <p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link href="/sell" className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-10 py-5 bg-[#002D72] text-white font-black rounded-xl shadow-lg shadow-[#002D72]/20 hover:bg-[#001D4A] transition-colors">
              Start Selling Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Why Buy With Shelby Exchange */}
      <section className="bg-white py-24 border-y border-[#dee1e6]">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#002D72]/10 rounded-full mb-6">
                <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">For Buyers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{cmsContent.whyBuyTitle}</h2>
              <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">{cmsContent.whyBuySubtitle}</p>
            </div>

            <div className="space-y-8 lg:hidden">
              {cmsContent.whyBuyReasons.map((reason, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="relative h-40 rounded-2xl overflow-hidden group">
                    <img
                      src={[
                        '/images/1967-ford-shelby-gt500-super-snake.avif',
                        '/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg',
                        '/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif',
                        '/images/2026_supersnaker_gallery_06-938430.jpg',
                      ][idx]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={reason.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                  </div>
                  <div className="group">
                    <div className="flex items-start gap-4">
                      <span className="text-[#002D72] font-black text-sm tracking-wider">{reason.num}</span>
                      <div>
                        <h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3>
                        <p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_2fr] gap-12">
              <div className="flex flex-col justify-center space-y-8 lg:order-1">
                {cmsContent.whyBuyReasons.map((reason, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-start gap-4">
                      <span className="text-[#002D72] font-black text-sm tracking-wider">{reason.num}</span>
                      <div>
                        <h3 className="font-outfit font-bold text-xl mb-2 group-hover:text-[#002D72] transition-colors">{reason.title}</h3>
                        <p className="text-[#565d6d] text-sm leading-relaxed">{reason.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:flex flex-col items-center justify-center relative py-8 lg:order-2">
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#002D72]/20 -translate-x-1/2" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="relative flex-1 flex items-center justify-center w-full">
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-[#002D72] rounded-full shadow-lg shadow-[#002D72]/30 animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-[#002D72] rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 lg:order-3">
                {[
                  { img: '/images/1967-ford-shelby-gt500-super-snake.avif', alt: 'Classic Shelby GT500' },
                  { img: '/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg', alt: 'Modern GT500' },
                  { img: '/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif', alt: 'Shelby GT500 Rear' },
                  { img: '/images/2026_supersnaker_gallery_06-938430.jpg', alt: 'Super Snake Detail' },
                ].map((item, idx) => (
                  <div key={idx} className="relative h-40 rounded-2xl overflow-hidden group">
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.alt} />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link href="/listings" className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-10 py-5 bg-[#002D72] text-white font-black rounded-xl shadow-lg shadow-[#002D72]/20 hover:bg-[#001D4A] transition-colors">
                Start Buying Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Performance Reports */}
      <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-[30px] font-extrabold tracking-tight mb-2">Performance Reports</h2>
            <p className="text-[#565d6d] text-lg">The latest in Shelby history, auction news, and engineering deep-dives.</p>
          </div>
          <Link href="/blog" className="flex items-center gap-4 px-6 py-2.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Read All Stories <ArrowRight className="w-4 h-4" />
          </Link>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {mainArticle ? (
              <>
                <div className="relative h-[430px] rounded-3xl overflow-hidden mb-8 shadow-lg">
                  <img src={mainArticle.image_url || '/images/logo.png'} className="w-full h-full object-cover" alt={mainArticle.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-6 left-6"><span className="px-5 py-1.5 bg-white text-[10px] font-black rounded-full uppercase">{mainArticle.category || 'News'}</span></div>
                </div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter mb-4 leading-tight break-words">{mainArticle.title}</h3>
                <p className="text-[#565d6d] text-lg mb-6 leading-relaxed">{mainArticle.excerpt || 'Read the latest Shelby insights and market updates.'}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#565d6d] uppercase tracking-widest">{new Date(mainArticle.published_at || mainArticle.created_at).toLocaleDateString()}</span>
                  <div className="w-1 h-1 bg-[#dee1e6] rounded-full" />
                  <Link href={`/blog/${mainArticle.slug || mainArticle.id}`} className="flex items-center gap-2 text-xs font-extrabold text-[#002D72] uppercase tracking-widest hover:underline">Read Story <ArrowRight className="w-3 h-3" /></Link>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-[#dee1e6] p-8 bg-gray-50">
                <h3 className="text-2xl font-black tracking-tight mb-2">Performance reports are coming soon</h3>
                <p className="text-[#565d6d]">Publish an article in Admin → News to feature it here.</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-8">
            {sideArticles.map((item: any) => (
              <Link key={item.id} href={`/blog/${item.slug || item.id}`} className="flex gap-6 group cursor-pointer">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm"><img src={item.image_url || '/images/logo.png'} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.title} /></div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-black text-[#E31837] uppercase tracking-widest">{item.category}</span>
                    <span className="text-[9px] font-bold text-[#565d6d] uppercase tracking-widest">{new Date(item.published_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-outfit font-bold text-lg leading-snug group-hover:text-[#002D72] transition-colors">{item.title}</h4>
                </div>
              </Link>
            ))}
            <div className="mt-4 p-8 bg-[#002D72]/5 rounded-3xl border border-[#002D72]/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div><h4 className="font-outfit font-bold text-lg mb-1">The Shelby Weekly</h4><p className="text-xs text-[#565d6d]">Auction alerts and performance reviews.</p></div>
              <button className="px-8 py-2.5 bg-[#002D72] text-white text-sm font-bold rounded-md hover:bg-[#001D4A] transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 md:px-12 max-w-[1440px] mx-auto w-full">
        <ScrollReveal>
          <KlaviyoInlineForm
            title="Get Weekly Shelby Deals & Listings"
            description="Be first to hear about hot listings, price drops, and collector opportunities."
            source="homepage_inline"
          />
        </ScrollReveal>
      </section>

<section className="relative bg-[#001530] py-32 overflow-hidden">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          <div className="relative group order-1 lg:order-2">
            <div className="absolute -inset-1 bg-white/10 rounded-[32px] blur-xl group-hover:bg-[#E31837]/20 transition-all duration-500" />
            <div className="relative h-[300px] lg:h-[480px] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <img src={cmsContent.ctaImage} className="w-full h-full object-cover" alt="Dream Shelby" />
              <div className="absolute inset-0 bg-[#002D72]/20 mix-blend-overlay" />
            </div>
          </div>
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-6 lg:mb-12">
              <div className="w-12 h-12 bg-[#E31837] rounded-full flex items-center justify-center"><span className="text-white font-bold text-xl">S</span></div>
              <span className="text-sm font-black text-white/60 uppercase tracking-[4px]">Ready to Ride?</span>
            </div>
            <h2 className="text-white font-outfit font-black text-3xl sm:text-5xl md:text-6xl leading-[0.95] uppercase tracking-tighter mb-6 lg:mb-10 break-words">
              {cmsContent.ctaTitle}
            </h2>
            <p className="text-[#9CA3AF] font-outfit text-xl max-w-lg mb-8 lg:mb-12 leading-relaxed">
              {cmsContent.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listings" className="w-full sm:w-auto px-12 py-5 bg-[#002D72] text-white font-black rounded-2xl shadow-2xl shadow-[#002D72]/30 hover:bg-[#001D4A] transition-all text-center">Browse All Inventory</Link>
              <Link href="/sell" className="w-full sm:w-auto px-12 py-5 bg-white text-[#323743] font-black rounded-2xl border border-white/20 hover:bg-gray-100 transition-all text-center">Sell Your Shelby</Link>
            </div>
          </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
