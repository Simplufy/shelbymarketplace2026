import Link from "next/link";
import { 
  Search, ChevronDown, Heart, ArrowRight, Calendar, Gauge, Zap, ExternalLink, 
  Clock, Star, ShieldCheck, CreditCard, ClipboardCheck 
} from "lucide-react";

export default function Home() {
  const featuredListings = [
    { id: 1, title: '2024 Shelby GT500 Heritage Edition', price: '$112,500', year: '2024', miles: '12', trans: '7-Speed', image: '/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg', tag: 'NEW ARRIVAL' },
    { id: 2, title: '2023 Shelby Super Snake', price: '$145,900', year: '2023', miles: '240', trans: '10-Speed', image: '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp' },
    { id: 3, title: '2022 Shelby GT350R', price: '$89,000', year: '2022', miles: '3,400', trans: '6-Speed', image: '/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg' },
    { id: 4, title: '1967 Shelby Mustang GT500 "Eleanor"', price: '$325,000', year: '1967', miles: '12,400', trans: '4-Speed', image: '/images/rare-rides-the-1967-shelby-gt500-super-snake-2020-12-14_03-04-23_399335.webp' },
  ];

  const latestArrivals = [
    { id: 1, title: '2024 F-150 Super Snake', price: '$135,000', image: '/images/2026_supersnaker_gallery_06-938430.jpg' },
    { id: 2, title: '2021 Shelby GT500 Signature', price: '$121,000', image: '/images/2013_Shelby_GT500_Cobra_frt_34.webp' },
    { id: 3, title: '2024 Shelby Cobra 427 S/C', price: '$185,000', image: '/images/1967-ford-shelby-gt500-super-snake.avif' },
  ];

  const newsItems = [
    { id: 1, category: 'Market News', date: 'March 22, 2024', title: 'Auction Results: 1965 GT350R Sells for Record $3.8M', image: '/images/1_Rw-9_7gZZDN7hY-PNMdlMg.jpg' },
    { id: 2, category: 'Guide', date: 'March 18, 2024', title: 'Top 5 Upgrades for your Shelby GT500 Performance Pack', image: '/images/66d55d55f1639484ad87e3c8_1FC667FA-0A92-46FE-8F54-AF79C6A9E17E.jpeg' },
    { id: 3, category: 'Collectors', date: 'March 15, 2024', title: 'How to Authenticate a Classic Shelby VIN', image: '/images/JDM_9800.jpg' },
  ];

  return (
    <div className="flex flex-col font-inter text-[#171a1f] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] bg-[#0F172A] overflow-hidden">
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

          <div className="glass-search max-w-3xl w-full rounded-2xl p-3 flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex-1 flex items-center gap-3 px-4 w-full bg-white/90 rounded-xl py-3">
              <Search className="w-5 h-5 text-[#565d6d]" />
              <input type="text" placeholder="Search by Model, Year, or ZIP..." className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#565d6d]/50 min-w-0" />
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">
              Search Inventory
            </button>
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map((car) => (
            <Link key={car.id} href={`/listings/${car.id}`} className="card-shadow bg-white rounded-xl border border-[#dee1e6] overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img src={car.image} className="w-full h-full object-cover" alt={car.title} />
                {car.tag && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#E31837] text-white text-[10px] font-bold rounded-full">{car.tag}</div>
                )}
                <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-outfit text-xl font-bold mb-2 line-clamp-1">{car.title}</h3>
                <span className="text-[#E31837] font-outfit text-2xl font-black mb-6">{car.price}</span>
                <div className="grid grid-cols-3 border-y border-[#f3f4f6] py-4 mb-6">
                  <div className="text-center border-r border-[#f3f4f6]">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                    <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Year</span>
                    <span className="text-xs font-semibold">{car.year}</span>
                  </div>
                  <div className="text-center border-r border-[#f3f4f6]">
                    <Gauge className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                    <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Miles</span>
                    <span className="text-xs font-semibold">{car.miles}</span>
                  </div>
                  <div className="text-center">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-[#565d6d]" />
                    <span className="block text-[10px] font-bold text-[#565d6d] uppercase">Trans</span>
                    <span className="text-xs font-semibold">{car.trans}</span>
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
      </section>

      {/* Latest Arrivals */}
      <section className="bg-[#f3f4f6]/20 py-24 border-y border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="inline-flex px-3 py-1 border border-[#002D72] rounded-full mb-8">
              <span className="text-[10px] font-bold text-[#002D72] uppercase tracking-wider">Latest Arrivals</span>
            </div>
            <h2 className="text-4xl md:text-[36px] font-extrabold leading-tight tracking-tighter mb-6">New Performance Icons Listed Daily.</h2>
            <p className="text-[#565d6d] text-lg mb-10">Our network of certified Shelby dealers and private collectors add dozens of authenticated performance vehicles every week.</p>
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#002D72]/10 rounded-full flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-[#002D72]" /></div>
                <div><h4 className="font-outfit font-bold text-sm">Real-time Updates</h4><p className="text-xs text-[#565d6d]">Be the first to see new Shelby stock.</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E31837]/10 rounded-full flex items-center justify-center shrink-0"><Star className="w-5 h-5 text-[#E31837]" /></div>
                <div><h4 className="font-outfit font-bold text-sm">Priority Notifications</h4><p className="text-xs text-[#565d6d]">Set alerts for specific model and year ranges.</p></div>
              </div>
            </div>
            <Link href="/listings" className="block w-full py-4 bg-[#002D72] text-white font-bold rounded-md hover:bg-[#001D4A] transition-colors text-center">View All Recent Listings</Link>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {latestArrivals.map((item) => (
              <div key={item.id} className="relative h-[345px] rounded-2xl overflow-hidden group">
                <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] font-black text-[#E31837] uppercase tracking-widest mb-2 block">Available Now</span>
                  <h4 className="text-white font-outfit font-bold text-lg mb-1 leading-tight">{item.title}</h4>
                  <span className="text-white/90 text-sm font-medium">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Reports */}
      <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-[30px] font-extrabold tracking-tight mb-2">Performance Reports</h2>
            <p className="text-[#565d6d] text-lg">The latest in Shelby history, auction news, and engineering deep-dives.</p>
          </div>
          <Link href="/news" className="flex items-center gap-4 px-6 py-2.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Read All Stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="relative h-[430px] rounded-3xl overflow-hidden mb-8 shadow-lg">
              <img src="/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg" className="w-full h-full object-cover" alt="Main Story" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-6 left-6"><span className="px-5 py-1.5 bg-white text-[10px] font-black rounded-full uppercase">Review</span></div>
            </div>
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter mb-4 leading-tight break-words">The Evolution of the Shelby Super Snake: 800+ HP for the Street</h3>
            <p className="text-[#565d6d] text-lg mb-6 leading-relaxed">Carroll Shelby&apos;s legacy continues with the boldest Super Snake yet. We go under the hood of the new S650-based monster.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#565d6d] uppercase tracking-widest">March 24, 2024</span>
              <div className="w-1 h-1 bg-[#dee1e6] rounded-full" />
              <Link href="/news" className="flex items-center gap-2 text-xs font-extrabold text-[#002D72] uppercase tracking-widest hover:underline">Read Story <ArrowRight className="w-3 h-3" /></Link>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-8">
            {newsItems.map((item) => (
              <div key={item.id} className="flex gap-6 group cursor-pointer">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm"><img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.title} /></div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-black text-[#E31837] uppercase tracking-widest">{item.category}</span>
                    <span className="text-[9px] font-bold text-[#565d6d] uppercase tracking-widest">{item.date}</span>
                  </div>
                  <h4 className="font-outfit font-bold text-lg leading-snug group-hover:text-[#002D72] transition-colors">{item.title}</h4>
                </div>
              </div>
            ))}
            <div className="mt-4 p-8 bg-[#002D72]/5 rounded-3xl border border-[#002D72]/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div><h4 className="font-outfit font-bold text-lg mb-1">The Shelby Weekly</h4><p className="text-xs text-[#565d6d]">Auction alerts and performance reviews.</p></div>
              <button className="px-8 py-2.5 bg-[#002D72] text-white text-sm font-bold rounded-md hover:bg-[#001D4A] transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-[#f3f4f6]/30 py-16 border-y border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0"><ShieldCheck className="w-6 h-6 text-[#002D72]" /></div>
            <div><h4 className="font-outfit font-bold text-sm tracking-tight">Verified Sellers</h4><p className="text-xs text-[#565d6d]">Every dealer and private seller is vetted.</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0"><CreditCard className="w-6 h-6 text-[#002D72]" /></div>
            <div><h4 className="font-outfit font-bold text-sm tracking-tight">Secure Payments</h4><p className="text-xs text-[#565d6d]">Escrow services for high-value transactions.</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0"><ClipboardCheck className="w-6 h-6 text-[#E31837]" /></div>
            <div><h4 className="font-outfit font-bold text-sm tracking-tight">Inspections Included</h4><p className="text-xs text-[#565d6d]">Comprehensive 150-point Shelby reports.</p></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#001530] py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_#002D7233_0%,_transparent_70%)] opacity-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#E31837]/20 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-[#E31837] rounded-full flex items-center justify-center"><span className="text-white font-bold text-xl">S</span></div>
              <span className="text-sm font-black text-white/60 uppercase tracking-[4px]">Ready to Ride?</span>
            </div>
            <h2 className="text-white font-outfit font-black text-4xl sm:text-6xl md:text-[72px] leading-[0.95] uppercase tracking-tighter mb-10 break-words">
              Your Dream <span className="text-[#E31837] italic font-inter">Shelby</span> is One Search Away.
            </h2>
            <p className="text-[#9CA3AF] font-outfit text-xl max-w-lg mb-12 leading-relaxed">
              Whether you&apos;re looking for a track-ready GT350R or a pristine 1960s classic, the Ford Shelby Exchange is your definitive destination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listings" className="px-12 py-5 bg-[#002D72] text-white font-black rounded-2xl shadow-2xl shadow-[#002D72]/30 hover:bg-[#001D4A] transition-all text-center">Browse All Inventory</Link>
              <Link href="/sell" className="px-12 py-5 bg-white text-[#323743] font-black rounded-2xl border border-white/20 hover:bg-gray-100 transition-all text-center">Sell Your Shelby</Link>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-white/10 rounded-[32px] blur-xl group-hover:bg-[#E31837]/20 transition-all duration-500" />
            <div className="relative h-[480px] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <img src="/images/c5f4c-hi-tech-mustang-front.webp" className="w-full h-full object-cover" alt="Dream Shelby" />
              <div className="absolute inset-0 bg-[#002D72]/20 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
