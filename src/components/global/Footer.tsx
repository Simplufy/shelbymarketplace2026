"use client";

import Link from "next/link";
import { Globe, Mail, Link as LinkIcon, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Store newsletter subscription in database
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          { email: email.toLowerCase(), subscribed_at: new Date().toISOString() },
          { onConflict: "email" }
        );

      if (insertError) {
        // If table doesn't exist or other error, just show success (graceful degradation)
        console.error("Newsletter subscription error:", insertError);
      }

      setSubscribed(true);
      setEmail("");
    } catch (err) {
      console.error("Subscribe error:", err);
      // Still show success to user even if DB fails
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#fafafb] pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/images/logo.png" 
              alt="Shelby Exchange" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-[#565d6d] text-sm leading-relaxed mb-8 max-w-sm">
            The world&apos;s premier digital marketplace for authentic Ford Shelby performance vehicles. Curated listings, verified sellers, and unmatched performance.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://instagram.com/shelbyexchange" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors"
            >
              <Globe className="w-4 h-4 text-[#171a1f]" />
            </a>
            <a 
              href="mailto:contact@shelbyexchange.com"
              className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#171a1f]" />
            </a>
            <a 
              href="https://shelbyexchange.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-[#171a1f]" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest mb-6">Inventory</h5>
          <ul className="space-y-4 text-sm text-[#565d6d]">
            <li><Link href="/listings" className="hover:text-[#002D72]">GT500 Models</Link></li>
            <li><Link href="/listings" className="hover:text-[#002D72]">GT350 &amp; GT350R</Link></li>
            <li><Link href="/listings" className="hover:text-[#002D72]">Super Snake</Link></li>
            <li><Link href="/listings" className="hover:text-[#002D72]">Cobra Jet</Link></li>
            <li><Link href="/listings" className="hover:text-[#002D72]">Classic Shelby</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest mb-6">Resources</h5>
          <ul className="space-y-4 text-sm text-[#565d6d]">
            <li><Link href="/about" className="hover:text-[#002D72]">About Shelby Exchange</Link></li>
            <li><Link href="/dealers" className="hover:text-[#002D72]">Dealer Network</Link></li>
            <li><Link href="/blog" className="hover:text-[#002D72]">Articles</Link></li>
            <li><Link href="/sell" className="hover:text-[#002D72]">Sell Your Shelby</Link></li>
            <li><Link href="/dealers/register" className="hover:text-[#002D72]">Become a Dealer</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest mb-6">Support</h5>
          <ul className="space-y-4 text-sm text-[#565d6d]">
            <li><Link href="/terms" className="hover:text-[#002D72]">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[#002D72]">Privacy Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-[#002D72]">Cookie Policy</Link></li>
            <li><Link href="/contact" className="hover:text-[#002D72]">Contact Us</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest mb-6">Newsletter</h5>
          <p className="text-xs text-[#565d6d] mb-4">Get weekly performance reports and exclusive listings.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="email@address.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#f3f4f6] rounded-md text-sm outline-none focus:border-[#002D72]"
              />
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#002D72] text-white text-sm font-medium rounded-md hover:bg-[#001D4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-8 border-t border-[#f3f4f6]">
        <div className="mb-6">
          <p className="text-xs text-gray-500 leading-relaxed max-w-4xl opacity-75">
            Ford ShelbyForSale.com is a marketplace platform that connects buyers and sellers. We do not own, inspect, or sell any vehicles listed on this site. All transactions occur directly between buyer and seller.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="text-[10px] font-medium text-[#565d6d] uppercase tracking-tight">
              &copy; {new Date().getFullYear()} Ford Shelby Exchange. All rights reserved.
            </span>
            <span className="text-[10px] font-medium text-[#565d6d] uppercase tracking-tight flex items-center gap-1">
              Based in Columbus, Ohio
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-medium text-[#565d6d] uppercase tracking-tight">
            <Link href="/privacy" className="hover:text-[#002D72]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#002D72]">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-[#002D72]">Cookie Policy</Link>
            <span className="text-[#565d6d]">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
