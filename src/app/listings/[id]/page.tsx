"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Share2, Calendar, Gauge, Zap, Palette, ShieldCheck, Copy, Check, Star, MapPin, ExternalLink, Phone, MessageSquare, ArrowRight, Calculator, Wrench, FileText, CalendarCheck } from "lucide-react";
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
  serviceHistory: [
    { date: "Mar 15, 2024", type: "Service", description: "15,000 mile service - Oil change, filter replacement, full inspection", mileage: "14,985" },
    { date: "Dec 8, 2023", type: "Maintenance", description: "Tire rotation and brake inspection", mileage: "12,450" },
    { date: "Sep 22, 2023", type: "Service", description: "10,000 mile service - Synthetic oil change, cabin filter", mileage: "9,875" },
    { date: "Jun 14, 2023", type: "Inspection", description: "Pre-delivery inspection - Certified by Shelby Performance LV", mileage: "7,200" },
    { date: "Apr 3, 2023", type: "Service", description: "5,000 mile service - Oil change, multi-point inspection", mileage: "4,950" },
    { date: "Jan 20, 2023", type: "Delivery", description: "Vehicle delivered to first owner - Brand new", mileage: "12" },
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

  const getServiceIcon = (type: string) => {
    switch(type) {
      case "Service": return <Wrench className="w-4 h-4" />;
      case "Maintenance": return <CalendarCheck className="w-4 h-4" />;
      case "Inspection": return <ShieldCheck className="w-4 h-4" />;
      case "Delivery": return <FileText className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

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

            {/* Vehicle History Timeline */}
            <div className="bg-[#fafafb] p-6 rounded-lg shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#002D72]/10 rounded-full flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-[#002D72]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-outfit font-bold">Vehicle History & Service Records</h3>
                    <p className="text-xs text-[#565d6d]">Complete maintenance history • FREE with every listing</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Clean Title
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#dee1e6]" />
                <div className="space-y-4">
                  {car.serviceHistory.map((record, idx) => (
                    <div key={idx} className="relative flex gap-4 pl-2">
                      <div className="relative z-10 w-5 h-5 rounded-full bg-white border-2 border-[#002D72] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#002D72]" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#565d6d]">{record.date}</span>
                          <span className="px-2 py-0.5 bg-[#002D72]/10 text-[#002D72] text-[10px] font-bold rounded">
                            {record.type}
                          </span>
                          <span className="text-[10px] text-[#565d6d]">{record.mileage} mi</span>
                        </div>
                        <p className="text-sm text-[#171a1f]">{record.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#dee1e6]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#565d6d]">VIN: {car.vin}</span>
                  <button onClick={copyVin} className="flex items-center gap-1 text-xs font-bold text-[#002D72] hover:underline">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy VIN"}
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
              {/* Contact Card */}
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
                  <button className="w-full h-12 bg-[#002D72] text-white font-bold rounded-md flex items-center justify-center gap-3 hover:bg-[#001D4A] transition-colors"><MessageSquare className="w-5 h-5" /> Email Seller</button>
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

              {/* You May Also Like */}
              <div className="bg-white rounded-lg shadow-soft border border-[#f3f4f6] p-6">
                <h3 className="text-lg font-outfit font-bold mb-4">You May Also Like</h3>
                <div className="space-y-4">
                  {car.related.slice(0, 3).map((r) => (
                    <Link key={r.id} href={`/listings/${r.id}`} className="flex gap-4 group cursor-pointer">
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate group-hover:text-[#002D72] transition-colors">{r.name}</h4>
                        <div className="text-sm font-bold text-[#E31837] mt-1">{r.price}</div>
                        <div className="text-xs text-[#565d6d]">{r.miles}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/listings" className="block mt-4 text-center text-sm font-medium text-[#002D72] hover:underline">
                  View All Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
