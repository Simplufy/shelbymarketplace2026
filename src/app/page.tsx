import Link from "next/link";
import { 
  Search, Heart, ArrowRight, Calendar, Gauge, Zap, ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Fetch featured listings from database
  const supabase = await createClient();
  
  const { data: featuredListings } = await supabase
    .from('active_listings')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'ACTIVE')
    .limit(4);

  const { data: newsItems } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(3);

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
        <img src="/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg" className="absolute inset-0 w-full h-full object-cover object-center" alt="Hero" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-12 h-full flex flex-col justify-center">
          <div className="inline-flex items-center px-4 py-1 bg-[#E31837]/20 border border-[#E31837]/30 rounded-full backdrop-blur-md mb-4 self-start">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Exclusively Shelby</span>
          </div>
          
          <h1 className="text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight tracking-tighter mb-2 drop-shadow-2xl break-words italic uppercase max-w-4xl">
            The Fastest Way to Buy or Sell a Ford Shelby
          </h1>
          
          <p className="text-[#D1D5DB] font-outfit text-lg max-w-lg mb-4">
            The world&apos;s premier marketplace for authentic Shelby engineering.
          </p>

          <form action="/listings" method="GET" className="glass-search max-w-3xl w-full mx-auto rounded-2xl p-3 flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex-1 flex items-center gap-3 px-4 w-full bg-white/90 rounded-xl py-3">
              <Search className="w-5 h-5 text-[#565d6d]" />
              <input 
                type="text" 
                name="search"
                placeholder="Search by Model, Year, or ZIP..." 
                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#565d6d]/50 min-w-0" 
              />
            </div>
            <button type="submit" className="w-full md:w-auto px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">
              Search Inventory
            </button>
          </form>
        </div>
      </section>

      {/* Quick Discovery */}
      <section className="bg-[#fafafb] border-b border-[#dee1e6] py-8">
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
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-[30px] font-extrabold tracking-tight mb-2">Featured Shelby Listings</h2>
            <p className="text-[#565d6d] text-lg">Curated high-performance icons from verified dealers nationwide.</p>
          </div>
          <Link href="/listings" className="flex items-center gap-4 px-6 py-2.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Explore All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-[#565d6d]">{car.dealership_name || 'Private Seller'}</span>
                    <span className="text-[10px] font-bold uppercase text-[#002D72] flex items-center gap-1">View Details <ArrowRight className="w-3 h-3" /></span>
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

      {/* Sell CTA */}
      <section className="bg-[#002D72] py-20 px-4 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-white font-black text-3xl md:text-4xl tracking-tight mb-4">Sell Your Shelby</h2>
            <p className="text-[#D1D5DB] text-lg max-w-md">Reach thousands of verified buyers. List your vehicle in minutes with our streamlined process.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sell" className="px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg hover:bg-[#c41530] transition-colors text-center">
              List Your Vehicle
            </Link>
            <Link href="/sell" className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-center">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-[30px] font-extrabold tracking-tight mb-2">Latest Shelby News</h2>
            <p className="text-[#565d6d] text-lg">Market updates, buying guides, and collector insights.</p>
          </div>
          <Link href="/news" className="flex items-center gap-4 px-6 py-2.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {newsItems && newsItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`} className="group cursor-pointer">
                <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
                  <img src={item.featured_image || '/images/logo.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase text-[#E31837]">{item.category}</span>
                  <span className="text-[10px] text-[#565d6d]">{new Date(item.published_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight group-hover:text-[#002D72] transition-colors line-clamp-2">{item.title}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-[#565d6d]">No news articles available at the moment.</p>
          </div>
        )}
      </section>

      {/* Trust Indicators */}
      <section className="bg-[#fafafb] border-y border-[#dee1e6] py-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Verified Listings' },
              { value: '$50M+', label: 'Vehicles Sold' },
              { value: '12K+', label: 'Active Buyers' },
              { value: '100%', label: 'Shelby Authentic' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-outfit font-black text-[#002D72] mb-1">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#565d6d]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="bg-gradient-to-br from-[#002D72] to-[#001D4A] rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-white font-black text-3xl md:text-5xl tracking-tight mb-4">Join the Shelby Exchange</h2>
          <p className="text-[#D1D5DB] text-lg max-w-xl mx-auto mb-8">Whether you&apos;re buying your dream Shelby or selling to the next enthusiast, we&apos;re here to make it happen.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/listings" className="px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg hover:bg-[#c41530] transition-colors">
              Browse Inventory
            </Link>
            <Link href="/sell" className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              Sell Your Shelby
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
