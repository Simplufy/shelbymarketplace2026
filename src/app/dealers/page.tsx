"use client";
import Link from "next/link";
import { Shield, TrendingUp, Users, ArrowRight, Check, Award } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";

const SUBSCRIPTIONS = [
  { id: "ENTHUSIAST", name: "Starter Dealer", price: 399, desc: "Best for low-volume dealers testing the platform.", features: ["Up to 10 active listings/mo", "Bypass one-time listing fees", "Admin prioritized review", "Dealer Profile Verification badge"] },
  { id: "GROWTH", name: "Growth Dealer", price: 599, desc: "Built for growing dealers who want steady lead flow and stronger placement.", features: ["25 listings", "Featured placement (limited)", "Priority approval", "Dealer badge"], cta: "Start Getting Leads" },
  { id: "APEX", name: "Apex Dealer", price: 999, desc: "Built for dealers who want maximum exposure, faster sales, and market dominance.", features: ["Unlimited active listings", "Homepage featured placement (rotating)", "Email blast to buyers (1x/month) 🔥", "Social media promotion 🔥", "Verified dealer badge", "Dedicated account manager"], recommended: true, note: "⭐ Most serious Shelby dealers choose this plan", valueCopy: ["Listing individually could cost $1,500+/month", "Apex Dealer gives you unlimited exposure for $999", "Close just ONE deal per month and this pays for itself."] },
];

export default function DealersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#002D72] py-12 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
        </div>
        <ScrollReveal>
          <div className="relative max-w-[1440px] mx-auto px-5 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 bg-white/10 border border-white/20 rounded-full mb-4 md:mb-8">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-[#E31837]" />
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Dealer Program</span>
          </div>
          <h1 className="font-outfit font-black text-2xl sm:text-3xl md:text-6xl text-white tracking-tighter mb-4 md:mb-6 uppercase break-words">
            Shelby Exchange<br /><span className="text-[#E31837]">Dealer Network</span>
          </h1>
          <p className="text-white/60 text-sm md:text-xl max-w-2xl mx-auto mb-6 md:mb-12">
            The high-performance Shelby vehicle market. Expand your reach to thousands of qualified buyers daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/dealers/register" className="px-8 md:px-10 py-3 md:py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg hover:bg-[#c41530] transition-colors text-sm md:text-base">
              Apply for Dealer Access
            </Link>
            <Link href="/dealers/login" className="px-8 md:px-10 py-3 md:py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-sm md:text-base">
              Dealer Sign In
            </Link>
          </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Benefits */}
      <section className="py-10 md:py-20 max-w-[1440px] mx-auto px-5 md:px-12">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl md:text-3xl font-outfit font-black tracking-tighter mb-3 md:mb-4">Why Dealers Choose Shelby Exchange</h2>
          <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">Premium tools and verified buyer access designed for the high-performance automotive market.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <ScrollReveal>
          <div className="bg-[#fafafb] p-5 md:p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#002D72]/30 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#002D72]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#002D72]/20 transition-colors"><Shield className="w-6 h-6 md:w-8 md:h-8 text-[#002D72]" /></div>
            <h3 className="font-outfit font-bold text-base md:text-xl mb-2 md:mb-3">Verified Trust</h3>
            <p className="text-[#565d6d] text-xs md:text-sm leading-relaxed">Earn our exclusive verified dealer badge, immediately establishing trust with high-net-worth buyers.</p>
          </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
          <div className="bg-[#fafafb] p-5 md:p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#E31837]/30 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E31837]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#E31837]/20 transition-colors"><TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#E31837]" /></div>
            <h3 className="font-outfit font-bold text-base md:text-xl mb-2 md:mb-3">Zero Listing Fees</h3>
            <p className="text-[#565d6d] text-xs md:text-sm leading-relaxed">Pay a flat monthly subscription instead of per-listing fees, increasing margins on volume sales.</p>
          </div>
          </ScrollReveal>
          <ScrollReveal delay={0.16}>
          <div className="bg-[#fafafb] p-5 md:p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#002D72]/30 transition-colors">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#002D72]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-[#002D72]/20 transition-colors"><Users className="w-6 h-6 md:w-8 md:h-8 text-[#002D72]" /></div>
            <h3 className="font-outfit font-bold text-base md:text-xl mb-2 md:mb-3">Direct Contact</h3>
            <p className="text-[#565d6d] text-xs md:text-sm leading-relaxed">Bypass typical marketplace friction. Buyers contact you directly via phone or email for leads.</p>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#002D72] py-8 md:py-16">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-5 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
          {[
            { value: "2,400+", label: "Accounts Created" },
            { value: "$1M+", label: "Monthly Volume" },
            { value: "98%", label: "Seller Satisfaction" },
            { value: "48hr", label: "Avg. Lead Response" },
          ].map(stat => (
            <div key={stat.label} className="min-w-0">
              <div className="text-xl sm:text-2xl md:text-4xl font-outfit font-black text-white mb-0.5 md:mb-1">{stat.value}</div>
              <div className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section className="py-10 md:py-20 max-w-[1440px] mx-auto px-5 md:px-12">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl md:text-3xl font-outfit font-black tracking-tighter mb-3 md:mb-4">Subscription Plans</h2>
          <p className="text-[#565d6d] text-sm md:text-lg">Choose the plan that fits your dealership&apos;s volume.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTIONS.map(pkg => (
            <ScrollReveal key={pkg.id} delay={pkg.id === "APEX" ? 0.1 : 0}>
              <div className={`relative rounded-2xl p-5 md:p-8 border-2 bg-white transition-all ${pkg.recommended ? "border-[#002D72] shadow-xl md:scale-105" : "border-[#dee1e6]"}`}>
              {pkg.recommended && <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-[#E31837] text-white text-[9px] md:text-[10px] uppercase font-black px-2 md:px-3 py-0.5 md:py-1 rounded shadow-md tracking-wider">Best Value</div>}
              <h3 className="font-outfit font-bold text-lg md:text-2xl mb-1 md:mb-2">{pkg.name}</h3>
              <div className="font-black text-2xl sm:text-3xl md:text-4xl text-[#002D72] mb-1 md:mb-2 break-words">${pkg.price} <span className="text-xs md:text-sm text-[#565d6d] font-medium">/ month</span></div>
              <p className="text-xs md:text-sm text-[#565d6d] mb-4 md:mb-8">{pkg.desc}</p>
              {"note" in pkg && pkg.note ? <p className="text-xs font-black text-[#E31837] mb-4">{pkg.note}</p> : null}
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs md:text-sm font-medium">
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-[#E31837] shrink-0 mt-0.5" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              {"valueCopy" in pkg && pkg.valueCopy ? (
                <div className="mb-4 md:mb-8 rounded-xl bg-[#002D72]/5 border border-[#002D72]/10 p-3 space-y-1.5">
                  {pkg.valueCopy.map((line) => <p key={line} className="text-[11px] md:text-xs font-bold text-[#002D72]">{line}</p>)}
                </div>
              ) : null}
              <Link href="/dealers/register" className={`block w-full py-3 md:py-4 text-center font-bold rounded-xl transition-colors text-sm md:text-base ${pkg.recommended ? "bg-[#002D72] text-white hover:bg-[#001D4A]" : "bg-[#f3f4f6] text-[#171a1f] hover:bg-[#002D72]/10"}`}>
                {pkg.cta || "Get Started"} <ArrowRight className="w-3 h-3 md:w-4 md:h-4 inline ml-1" />
              </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
