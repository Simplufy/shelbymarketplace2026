"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Share2, Calendar, Gauge, Zap, Palette, ShieldCheck, Copy, Check, Star, MapPin, ExternalLink, Phone, MessageSquare, ArrowRight, Calculator } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

const MOCK = {
  id: "1", year: 2022, make: "Ford Shelby", model: "GT500", trim: "Heritage Edition",
  price: 124900, msrp: 127450, location: "Las Vegas, NV", dateListed: "Listed 2 days ago",
  images: [
    "/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg",
    "/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg",
    "/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg",
    "/images/2-w-A-FrontSide.webp",
    "/images/05_FordMustang.webp",
  ],
  specs: { mileage: "1,240 mi", transmission: "7-Speed Dual Clutch", engine: "5.2L V8 Predator Supercharged", exterior: "Brittany Blue w/ Wimbledon White Stripes" },
  vin: "1FA6P8SJ1N51XXXXX",
  history: { title: "Clean", owners: 1, accidents: "None" },
  description: [
    "This 2022 Ford Shelby GT500 Heritage Edition is a masterpiece of modern engineering and a tribute to the legendary 1967 GT500. Finished in the iconic Brittany Blue with Wimbledon White over-the-top racing stripes, this vehicle has been meticulously maintained and features only 1,240 original miles.",
    "The Heritage Edition is restricted to just a few hundred units, making this a collector's dream. Equipped with the Carbon Fiber Track Pack, it includes 20-inch exposed carbon fiber wheels, adjustable strut top mounts, and a massive carbon fiber GT4 track wing."
  ],
  features: ["Carbon Fiber Track Pack", "MagneRide Damping System", "Brembo™ High-Performance Brakes", "TORSEN® Differential", "B&O® Sound System by Bang & Olufsen", "Alcantara®-Wrapped Steering Wheel", "Recaro® Leather-Trimmed Front Seats", "Blind Spot Information System (BLIS)", "Dual-Zone Electronic Climate Control", "Sync® 3 with 8-inch Touchscreen"],
  technicalSpecs: [
    { label: "Fuel Type", value: "Premium Unleaded (93 Octane Required)" },
    { label: "Drivetrain", value: "Rear-Wheel Drive (RWD)" },
    { label: "Brakes", value: "Brembo™ 6-Piston Front, 4-Piston Rear" },
    { label: "Weight", value: "4,171 lbs" },
    { label: "Horsepower", value: "760 hp @ 7,300 rpm" },
    { label: "Torque", value: "625 lb-ft @ 5,000 rpm" },
  ],
  seller: { name: "Shelby Performance LV", rating: 4.9, reviews: 214, phone: "(702) 555-0199", location: "Las Vegas Motor Speedway, NV", avatar: "/images/cq5dam.web.1280.1280.avif" },
  related: [
    { id: 2, image: "/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg", name: "2020 Shelby GT350R", price: "$98,500", miles: "4,500 mi" },
    { id: 3, image: "/images/2026_supersnaker_gallery_06-938430.jpg", name: "2023 Shelby F-150 Super Snake", price: "$112,000", miles: "500 mi" },
    { id: 5, image: "/images/1967-ford-shelby-gt500-super-snake.avif", name: "2021 Shelby Cobra 427 Replica", price: "$85,900", miles: "2,100 mi" },
    { id: 7, image: "/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp", name: "2022 Shelby Super Snake", price: "$135,000", miles: "150 mi" },
  ]
};

export default function VehicleDetailPage() {
  const [activeThumb, setActiveThumb] = useState(0);
  const [copied, setCopied] = useState(false);
  const car = MOCK;

  const copyVin = () => { navigator.clipboard.writeText(car.vin); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1440px] mx-auto px-4 lg:px-16 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#565d6d] mb-6">
          <Link href="/listings" className="hover:text-[#002D72]">Inventory</Link><ChevronRight className="w-3 h-3" />
          <span>{car.make}</span><ChevronRight className="w-3 h-3" />
          <span>{car.model}</span><ChevronRight className="w-3 h-3" />
          <span className="font-medium text-[#171a1f]">{car.trim}</span>
        </nav>

        {/* Title & Price */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-4 break-words">{car.year} {car.make} {car.model} {car.trim}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#002D72]/10 border border-[#002D72]/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-[#002D72]" /><span className="text-xs font-semibold text-[#002D72]">Certified Heritage Edition</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[#565d6d]"><Calendar className="w-4 h-4" /><span>{car.dateListed}</span></div>
              <FavoriteButton listingId={car.id} showLabel />
              <button className="flex items-center gap-1.5 text-sm text-[#565d6d] hover:text-[#002D72]"><Share2 className="w-4 h-4" /> Share</button>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-3xl md:text-4xl font-outfit font-black text-[#E31837]">${car.price.toLocaleString()}</div>
            <div className="text-sm text-[#565d6d] font-medium mt-1">MSRP: ${car.msrp.toLocaleString()} (Window Sticker Included)</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full bg-[#f3f4f6] rounded-lg overflow-hidden shadow-sm">
                <img src={car.images[activeThumb]} alt="Main" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {car.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveThumb(idx)} className={`flex-shrink-0 w-32 h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${idx === activeThumb ? 'border-[#002D72]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Gauge, label: "MILEAGE", value: car.specs.mileage },
                { icon: Zap, label: "TRANSMISSION", value: car.specs.transmission },
                { icon: Zap, label: "ENGINE", value: car.specs.engine },
                { icon: Palette, label: "EXTERIOR", value: car.specs.exterior },
              ].map((spec, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-soft border border-[#f3f4f6] min-w-0 overflow-hidden">
                  <spec.icon className="w-5 h-5 mb-3 text-[#002D72] shrink-0" />
                  <div className="text-[10px] font-bold tracking-wider text-[#565d6d] uppercase mb-1">{spec.label}</div>
                  <div className="text-sm font-semibold leading-tight break-words">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* CARFAX */}
            <div className="bg-[#fafafb] p-6 rounded-lg shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0"><ShieldCheck className="w-8 h-8 text-green-500" /></div>
                <div>
                  <h3 className="text-lg font-outfit font-bold mb-1">CARFAX® Vehicle History</h3>
                  <p className="text-sm text-[#565d6d] mb-2">Verified {car.history.title} Title. {car.history.accidents} accidents reported. {car.history.owners}-Owner vehicle.</p>
                  <button className="text-sm font-bold text-[#002D72] hover:underline">View Full Report</button>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="text-[10px] font-bold tracking-widest text-[#565d6d] uppercase mb-2">VIN NUMBER</div>
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-white border border-[#f3f4f6] rounded-md">
                  <span className="text-sm font-bold font-mono">{car.vin}</span>
                  <button onClick={copyVin} className="text-[#565d6d] hover:text-[#002D72]">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-outfit font-bold mb-4">Seller&apos;s Description</h2>
              <div className="space-y-4 text-[#565d6d] leading-relaxed">
                {car.description.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-outfit font-bold mb-6">Key Features &amp; Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {car.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f3f4f6]">
                    <Check className="w-4 h-4 text-[#002D72]" /><span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical Specs */}
            <section>
              <h2 className="text-2xl font-outfit font-bold mb-6">Technical Specifications</h2>
              <div className="border border-[#f3f4f6] rounded-lg overflow-hidden">
                {car.technicalSpecs.map((spec, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 ${idx !== car.technicalSpecs.length - 1 ? 'border-b border-[#f3f4f6]' : ''} ${idx % 2 === 0 ? 'bg-[#fafafb]' : ''}`}>
                    <span className="text-sm font-medium text-[#565d6d]">{spec.label}</span>
                    <span className="text-sm font-bold text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-lg shadow-soft border-t-4 border-[#002D72] p-6 overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#002D72]/10"><img src={car.seller.avatar} alt="Dealer" className="w-full h-full object-cover" /></div>
                  <div>
                    <h3 className="text-lg font-outfit font-bold">{car.seller.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-bold">{car.seller.rating}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                      <span className="text-xs text-[#565d6d] ml-1">({car.seller.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <button className="w-full h-12 bg-[#002D72] text-white font-bold rounded-md flex items-center justify-center gap-3 hover:bg-[#001D4A] transition-colors"><MessageSquare className="w-5 h-5" /> Contact Seller</button>
                  <button className="w-full h-12 bg-white border border-[#dee1e6] font-semibold rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"><Phone className="w-5 h-5" /> {car.seller.phone}</button>
                </div>
                <div className="pt-6 border-t border-[#f3f4f6] space-y-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">Financing from</span><span className="text-lg font-bold">$1,842 /mo</span></div>
                  <button className="w-full h-10 bg-[#f3f4f6] text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"><Calculator className="w-4 h-4" /> Estimate Monthly Payments</button>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#565d6d]"><MapPin className="w-3 h-3" /> {car.seller.location}</div>
                  <div className="flex items-center gap-2 text-xs text-[#565d6d] cursor-pointer hover:text-[#002D72]"><ExternalLink className="w-3 h-3" /> Visit Dealer Website</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Inventory */}
        <section className="mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-outfit font-extrabold mb-2">You May Also Like</h2>
              <p className="text-[#565d6d]">Other high-performance Shelby vehicles in our exchange.</p>
            </div>
            <Link href="/listings" className="px-6 py-2 border-2 border-[#dee1e6] rounded-md text-sm font-bold hover:bg-gray-50 transition-colors">View All Inventory</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {car.related.map((r) => (
              <Link key={r.id} href={`/listings/${r.id}`} className="bg-white rounded-lg shadow-soft border border-[#f3f4f6] overflow-hidden group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden"><img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-4">
                  <h4 className="text-base font-outfit font-bold mb-1 truncate">{r.name}</h4>
                  <div className="text-lg font-bold text-[#E31837] mb-3">{r.price}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#565d6d]">{r.miles}</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-[#002D72]">View Details <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-24 bg-[#002D72]/5 border-2 border-[#002D72]/10 rounded-xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-outfit font-bold text-[#002D72] mb-2">Ready to start your Shelby journey?</h2>
            <p className="text-[#565d6d]">Get pre-approved for financing or trade-in your current vehicle today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="px-8 py-3 bg-[#002D72] text-white font-medium rounded-md hover:bg-[#001D4A] transition-colors">Get Pre-Approved</button>
            <button className="px-8 py-3 bg-white border-2 border-[#dee1e6] font-medium rounded-md hover:bg-gray-50 transition-colors">Value Your Trade</button>
          </div>
        </section>
      </main>
    </div>
  );
}
