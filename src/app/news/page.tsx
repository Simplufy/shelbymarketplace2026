"use client";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";

const ARTICLES = [
  { id: 1, category: "Review", date: "Mar 24, 2024", title: "The Evolution of the Shelby Super Snake: 800+ HP for the Street", excerpt: "Carroll Shelby's legacy continues with the boldest Super Snake yet. We go under the hood of the new S650-based monster.", image: "/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg", featured: true, readTime: "8 min" },
  { id: 2, category: "Market News", date: "Mar 22, 2024", title: "Auction Results: 1965 GT350R Sells for Record $3.8M", excerpt: "Barrett-Jackson's Scottsdale auction set a new record for the R-model, cementing its status as the most valuable Shelby.", image: "/images/1_Rw-9_7gZZDN7hY-PNMdlMg.jpg", readTime: "5 min" },
  { id: 3, category: "Guide", date: "Mar 18, 2024", title: "Top 5 Upgrades for your Shelby GT500 Performance Pack", excerpt: "From supercharger pulleys to suspension tuning, here are the mods that actually make a difference on track day.", image: "/images/66d55d55f1639484ad87e3c8_1FC667FA-0A92-46FE-8F54-AF79C6A9E17E.jpeg", readTime: "6 min" },
  { id: 4, category: "Collectors", date: "Mar 15, 2024", title: "How to Authenticate a Classic Shelby VIN", excerpt: "Not every Shelby is what it claims to be. Learn the detective work behind verifying a genuine classic.", image: "/images/JDM_9800.jpg", readTime: "7 min" },
  { id: 5, category: "Review", date: "Mar 12, 2024", title: "2024 Shelby F-150 Super Snake: Truck Meets Track", excerpt: "We test the 775HP F-150 Super Snake on both the highway and on a closed course to see if it lives up to the hype.", image: "/images/2026_supersnaker_gallery_06-938430.jpg", readTime: "9 min" },
  { id: 6, category: "Market News", date: "Mar 10, 2024", title: "Why Vintage Shelby Prices Are Skyrocketing in 2024", excerpt: "An analysis of the collector car market reveals that original Shelby Cobras and Mustangs have seen 40% increases.", image: "/images/1200_900.jpg", readTime: "6 min" },
  { id: 7, category: "Guide", date: "Mar 8, 2024", title: "The Complete Shelby GT350 Buyer's Guide", excerpt: "Everything you need to know before purchasing a GT350 or GT350R, from common issues to fair market values.", image: "/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif", readTime: "12 min" },
  { id: 8, category: "Collectors", date: "Mar 5, 2024", title: "Inside Carroll Shelby's Personal Car Collection", excerpt: "A rare look at the vehicles Carroll Shelby kept for himself during his legendary career.", image: "/images/1-59.webp", readTime: "10 min" },
  { id: 9, category: "Review", date: "Mar 2, 2024", title: "Electric Shelby? The Future of High-Performance EVs", excerpt: "Shelby American hints at electrification. We explore what a battery-powered Super Snake could look like.", image: "/images/images.jpg", readTime: "7 min" },
];

const CATEGORIES = ["All", "Market News", "Guide", "Collectors", "Review"];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const featured = ARTICLES.find(a => a.featured);
  const filtered = ARTICLES.filter(a => !a.featured && (activeCategory === "All" || a.category === activeCategory));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-black tracking-tighter mb-4 break-words">News &amp; Reviews</h1>
          <p className="text-lg text-[#565d6d] max-w-2xl">The latest in Shelby history, auction news, performance guides, and engineering deep-dives from the Ford Shelby Exchange editorial team.</p>
        </div>

        {/* Featured Story */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden mb-16 group cursor-pointer">
            <div className="aspect-[21/9] md:aspect-[3/1]">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-1.5 bg-[#E31837] text-white text-[10px] font-black rounded-full uppercase tracking-wider">Featured</span>
            </div>
            <div className="absolute bottom-8 left-8 right-8 md:max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-[#E31837] uppercase tracking-widest">{featured.category}</span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{featured.date}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white/60"><Clock className="w-3 h-3" /> {featured.readTime} read</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-outfit font-black text-white leading-tight mb-3 break-words">{featured.title}</h2>
              <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#E31837] transition-colors">
                Read Full Story <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? "bg-[#002D72] text-white shadow-md" : "bg-[#f3f4f6] text-[#565d6d] hover:bg-[#002D72]/10 hover:text-[#002D72]"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(article => (
            <article key={article.id} className="bg-white rounded-2xl border border-[#dee1e6] overflow-hidden card-shadow group cursor-pointer">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9px] font-black text-[#E31837] uppercase tracking-widest">{article.category}</span>
                  <span className="text-[9px] font-bold text-[#565d6d] uppercase tracking-widest">{article.date}</span>
                </div>
                <h3 className="text-lg font-outfit font-bold leading-snug mb-3 group-hover:text-[#002D72] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-sm text-[#565d6d] leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#565d6d]"><Clock className="w-3 h-3" /> {article.readTime} read</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-[#002D72] group-hover:underline">Read More <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-[#565d6d] mb-6">Try selecting a different category.</p>
            <button onClick={() => setActiveCategory("All")} className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-lg">Show All</button>
          </div>
        )}
      </div>
    </div>
  );
}
