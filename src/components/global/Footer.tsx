import Link from "next/link";
import { Globe, Mail, Link as LinkIcon } from "lucide-react";

export default function Footer() {
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
            <button className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors">
              <Globe className="w-4 h-4 text-[#171a1f]" />
            </button>
            <button className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors">
              <Mail className="w-4 h-4 text-[#171a1f]" />
            </button>
            <button className="w-10 h-10 bg-[#f3f4f6]/50 rounded-full flex items-center justify-center hover:bg-[#002D72]/10 transition-colors">
              <LinkIcon className="w-4 h-4 text-[#171a1f]" />
            </button>
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
            <li><button className="hover:text-[#002D72]">Financing</button></li>
            <li><button className="hover:text-[#002D72]">Inspections</button></li>
            <li><button className="hover:text-[#002D72]">Shipping</button></li>
            <li><Link href="/sell" className="hover:text-[#002D72]">Sell Your Shelby</Link></li>
            <li><button className="hover:text-[#002D72]">Value Tracker</button></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest mb-6">Newsletter</h5>
          <p className="text-xs text-[#565d6d] mb-6">Get weekly performance reports.</p>
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="email@address.com" 
              className="w-full px-4 py-3 bg-white border border-[#f3f4f6] rounded-md text-sm outline-none focus:border-[#002D72]"
            />
            <button className="w-full py-3 bg-[#002D72] text-white text-sm font-medium rounded-md hover:bg-[#001D4A] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-8 border-t border-[#f3f4f6]">
        <div className="mb-6">
          <p className="text-xs text-gray-500 leading-relaxed max-w-4xl opacity-75">
            <strong>Disclaimer:</strong> FordShelbyForSale.com is an independent marketplace and is not affiliated with, sponsored by, or endorsed by Ford Motor Company or Carroll Shelby Licensing. We are an advertising platform only; all transactions are peer-to-peer.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[10px] font-medium text-[#565d6d] uppercase tracking-tight">
            &copy; {new Date().getFullYear()} Ford Shelby Exchange. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-medium text-[#565d6d] uppercase tracking-tight">
            <button className="hover:text-[#002D72]">Privacy Policy</button>
            <button className="hover:text-[#002D72]">Terms of Service</button>
            <button className="hover:text-[#002D72]">Cookie Policy</button>
            <button className="hover:text-[#002D72]">Accessibility</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
