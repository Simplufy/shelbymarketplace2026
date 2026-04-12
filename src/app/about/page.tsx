import Link from "next/link";
import { ShieldCheck, Users, Trophy, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Shelby Exchange",
  description:
    "Learn about Shelby Exchange, the premium marketplace for buying and selling authentic Ford Shelby vehicles.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#001530] py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 text-white">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-[#E31837] mb-4">About Us</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Built for Shelby Enthusiasts</h1>
          <p className="text-[#D1D5DB] text-lg max-w-3xl leading-relaxed">
            Shelby Exchange is a focused marketplace built to connect serious buyers, collectors, and sellers of
            authentic Ford Shelby vehicles. We remove noise and give the community a trusted place to transact.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#fafafb] border border-[#dee1e6] rounded-2xl p-8">
            <ShieldCheck className="w-8 h-8 text-[#002D72] mb-4" />
            <h2 className="font-outfit font-bold text-2xl mb-3">Trusted Listings</h2>
            <p className="text-[#565d6d] text-sm leading-relaxed">
              We prioritize quality over quantity so buyers can evaluate vehicles with confidence and sellers can
              reach high-intent enthusiasts.
            </p>
          </div>

          <div className="bg-[#fafafb] border border-[#dee1e6] rounded-2xl p-8">
            <Users className="w-8 h-8 text-[#002D72] mb-4" />
            <h2 className="font-outfit font-bold text-2xl mb-3">Community First</h2>
            <p className="text-[#565d6d] text-sm leading-relaxed">
              From first-time buyers to long-time collectors, we support a community that values performance,
              heritage, and authenticity.
            </p>
          </div>

          <div className="bg-[#fafafb] border border-[#dee1e6] rounded-2xl p-8">
            <Trophy className="w-8 h-8 text-[#002D72] mb-4" />
            <h2 className="font-outfit font-bold text-2xl mb-3">Premium Experience</h2>
            <p className="text-[#565d6d] text-sm leading-relaxed">
              We are building the standard for Shelby transactions with polished tools, transparent communication,
              and seller-focused promotions.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="rounded-3xl bg-gradient-to-r from-[#002D72] to-[#001D4A] p-10 md:p-14 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-3xl font-black mb-3">Ready to Join Shelby Exchange?</h3>
              <p className="text-[#D1D5DB] max-w-2xl">
                Browse current inventory or list your Shelby today and connect with motivated buyers.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/listings"
                className="px-6 py-3 bg-[#E31837] text-white font-bold rounded-xl hover:bg-[#c41530] transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/sell"
                className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors inline-flex items-center gap-2"
              >
                Sell Your Shelby <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
