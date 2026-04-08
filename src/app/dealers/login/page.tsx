"use client";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { useState } from "react";

export default function DealerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left - Dealer Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#002D72]/80 to-[#0F172A]" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#E31837]/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#002D72] rounded-xl flex items-center justify-center"><Building2 className="w-7 h-7 text-white" /></div>
            <div>
              <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest block">Dealer Portal</span>
              <span className="text-white font-outfit font-bold text-lg">Shelby Exchange</span>
            </div>
          </div>
          <h2 className="text-white font-outfit font-black text-4xl sm:text-5xl leading-tight tracking-tighter mb-6 uppercase break-words">
            Dealer<br />Access.
          </h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            Manage your inventory, track leads, and access premium dealer tools for the Shelby Exchange marketplace.
          </p>
          <div className="mt-16 grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-2xl font-black text-white mb-1">2,400+</div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Active Buyers</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-2xl font-black text-[#E31837] mb-1">$14M+</div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Monthly Volume</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-[#002D72] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <div>
              <span className="text-[9px] font-bold text-[#E31837] uppercase tracking-widest">Dealer Portal</span>
              <span className="font-heading text-lg font-bold text-[#002D72] tracking-tighter block">Shelby Exchange</span>
            </div>
          </div>

          <h1 className="text-3xl font-outfit font-black tracking-tight mb-2">Dealer Sign In</h1>
          <p className="text-[#565d6d] mb-10">Access your dealer dashboard and inventory management tools.</p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Dealer Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                <input type="email" placeholder="dealer@company.com" className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f]">Password</label>
                <button type="button" className="text-[11px] font-bold text-[#E31837] hover:underline uppercase tracking-wider">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-12 pl-12 pr-12 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#565d6d] hover:text-[#002D72]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full h-12 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors shadow-lg shadow-[#002D72]/20">
              Sign In to Dealer Portal
            </button>
          </form>

          <div className="mt-8 p-6 bg-[#002D72]/5 rounded-xl border border-[#002D72]/10">
            <h3 className="font-bold text-sm mb-2">Not a dealer yet?</h3>
            <p className="text-xs text-[#565d6d] mb-4">Join our exclusive dealer network and get access to premium tools and qualified buyers.</p>
            <Link href="/dealers/register" className="block w-full py-3 bg-[#E31837] text-white text-sm font-bold rounded-md text-center hover:bg-[#c41530] transition-colors">
              Apply for Dealer Access
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs font-medium text-[#565d6d] hover:text-[#002D72]">← Back to regular sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
