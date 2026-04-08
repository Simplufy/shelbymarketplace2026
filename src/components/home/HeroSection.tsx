import { Search } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background Image Placeholder */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <h1 className="font-heading font-extrabold text-white text-5xl md:text-7xl tracking-tighter uppercase mb-6 drop-shadow-lg">
          Shelby Performance. <span className="text-[var(--color-shelby-red)]">Curated.</span>
        </h1>
        <p className="text-xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
          The premier marketplace strictly designed for high-end, exclusive Ford Shelby vehicles.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-3xl glass-card rounded-2xl p-2 flex flex-col sm:flex-row shadow-2xl backdrop-blur-xl border border-white/20">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input 
              type="text" 
              placeholder="Search model, year, or trim..." 
              className="w-full pl-14 pr-4 py-4 rounded-xl bg-transparent border-none focus:ring-0 text-gray-800 text-lg outline-none placeholder:text-gray-500 font-medium"
            />
          </div>
          <button className="mt-2 sm:mt-0 px-10 py-4 bg-[var(--color-shelby-blue)] hover:bg-[#001D40] text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 shrink-0">
            Search Inventory
          </button>
        </div>

        {/* Quick Search Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {["GT500", "Cobra", "Super Snake", "GT350", "F-150 Shelby", "Vintage"].map((tag) => (
            <Link key={tag} href={`/listings?q=${tag}`} className="px-5 py-2.5 bg-white/10 hover:bg-[var(--color-shelby-red)] border border-white/30 backdrop-blur-md text-white text-sm font-semibold rounded-full transition-all shadow-sm">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
