"use client";
import Link from "next/link";
import { Shield, TrendingUp, Users, ArrowRight, Check, Award } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";

const SUBSCRIPTIONS = [
  { id: "ENTHUSIAST", name: "Enthusiast Dealer", price: 400, desc: "Perfect for specialty dealers moving low volume of Shelby vehicles.", features: ["Up to 10 active listings/mo", "Bypass one-time listing fees", "Admin prioritized review", "Dealer Profile Verification badge"] },
  { id: "APEX", name: "Apex Dealer", price: 1000, desc: "For high-volume dealerships dominating the performance market.", features: ["Unlimited active listings", "Bypass one-time listing fees", "Immediate auto-approval", "Homepage Featured Slot (1/mo)", "Dedicated Account Manager"], recommended: true },
];

export default function DealersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#002D72] py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/ford-mustang-shelby-gt500-goodwood-17012019.jpg" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000D2A] via-[#001D4A]/80 to-[#002D72]/60" />
        </div>
        <ScrollReveal>
          <div className="relative max-w-[1440px] mx-auto px-4 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 border border-white/20 rounded-full mb-8">
            <Award className="w-4 h-4 text-[#E31837]" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Dealer Program</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-6xl text-white tracking-tighter mb-6 uppercase break-words">
            Shelby Exchange<br /><span className="text-[#E31837]">Dealer Network</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-12">
            Join the most exclusive network of high-performance Ford Shelby dealers. Expand your reach to thousands of qualified buyers daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dealers/register" className="px-10 py-4 bg-[#E31837] text-white font-black rounded-xl shadow-lg hover:bg-[#c41530] transition-colors">
              Apply for Dealer Access
            </Link>
            <Link href="/dealers/login" className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              Dealer Sign In
            </Link>
          </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 md:px-12">
        <ScrollReveal>
          <div className="text-center mb-16">
          <h2 className="text-3xl font-outfit font-black tracking-tighter mb-4">Why Dealers Choose Shelby Exchange</h2>
          <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">Premium tools and verified buyer access designed for the high-performance automotive market.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal>
          <div className="bg-[#fafafb] p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#002D72]/30 transition-colors">
            <div className="w-16 h-16 bg-[#002D72]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#002D72]/20 transition-colors"><Shield className="w-8 h-8 text-[#002D72]" /></div>
            <h3 className="font-outfit font-bold text-xl mb-3">Verified Trust</h3>
            <p className="text-[#565d6d] text-sm leading-relaxed">Earn our exclusive verified dealer badge, immediately establishing trust with high-net-worth buyers.</p>
          </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
          <div className="bg-[#fafafb] p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#E31837]/30 transition-colors">
            <div className="w-16 h-16 bg-[#E31837]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#E31837]/20 transition-colors"><TrendingUp className="w-8 h-8 text-[#E31837]" /></div>
            <h3 className="font-outfit font-bold text-xl mb-3">Zero Listing Fees</h3>
            <p className="text-[#565d6d] text-sm leading-relaxed">Pay a flat monthly subscription instead of per-listing fees, increasing margins on volume sales.</p>
          </div>
          </ScrollReveal>
          <ScrollReveal delay={0.16}>
          <div className="bg-[#fafafb] p-8 rounded-2xl border border-[#dee1e6] text-center group hover:border-[#002D72]/30 transition-colors">
            <div className="w-16 h-16 bg-[#002D72]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#002D72]/20 transition-colors"><Users className="w-8 h-8 text-[#002D72]" /></div>
            <h3 className="font-outfit font-bold text-xl mb-3">Direct Contact</h3>
            <p className="text-[#565d6d] text-sm leading-relaxed">Bypass typical marketplace friction. Buyers contact you directly via phone or email for leads.</p>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#002D72] py-16">
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,400+", label: "Active Buyers" },
            { value: "$14M+", label: "Monthly Volume" },
            { value: "98%", label: "Seller Satisfaction" },
            { value: "48hr", label: "Avg. Lead Response" },
          ].map(stat => (
            <div key={stat.label} className="min-w-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-outfit font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 md:px-12">
        <ScrollReveal>
          <div className="text-center mb-16">
          <h2 className="text-3xl font-outfit font-black tracking-tighter mb-4">Subscription Plans</h2>
          <p className="text-[#565d6d] text-lg">Choose the plan that fits your dealership&apos;s volume.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {SUBSCRIPTIONS.map(pkg => (
            <ScrollReveal key={pkg.id} delay={pkg.id === "APEX" ? 0.1 : 0}>
              <div className={`relative rounded-2xl p-8 border-2 bg-white transition-all ${pkg.recommended ? "border-[#002D72] shadow-xl scale-105" : "border-[#dee1e6]"}`}>
              {pkg.recommended && <div className="absolute top-4 right-4 bg-[#E31837] text-white text-[10px] uppercase font-black px-3 py-1 rounded shadow-md tracking-wider">Best Value</div>}
              <h3 className="font-outfit font-bold text-2xl mb-2">{pkg.name}</h3>
              <div className="font-black text-3xl sm:text-4xl text-[#002D72] mb-2 break-words">${pkg.price} <span className="text-sm text-[#565d6d] font-medium">/ month</span></div>
              <p className="text-sm text-[#565d6d] mb-8">{pkg.desc}</p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-[#E31837] shrink-0 mt-0.5" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dealers/register" className={`block w-full py-4 text-center font-bold rounded-xl transition-colors ${pkg.recommended ? "bg-[#002D72] text-white hover:bg-[#001D4A]" : "bg-[#f3f4f6] text-[#171a1f] hover:bg-[#002D72]/10"}`}>
                Get Started <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
