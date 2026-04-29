"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Globe, Heart, Menu, X, User, LogOut, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const inventoryFilters = ["GT500", "GT350", "GT350R", "Super Snake", "Cobra Jet", "Classic Shelby"];

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    router.push("/");
    router.refresh();
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <>
      {/* Top Banner - Homepage Only */}
      {isHomepage && (
        <div className="bg-[#E31837] py-2 px-4 text-center">
          <p className="text-white text-[11px] sm:text-sm font-bold tracking-wide leading-tight">
            New Listings Added Weekly | Join 100+ Shelby Buyers Today
          </p>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-[#f3f4f6]/30 py-2 px-5 md:px-8 border-b border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center gap-4 text-[11px] font-medium text-[#565d6d]">
          <a href="tel:6149177107" className="flex items-center gap-1.5 hover:text-[#E31837] transition-colors font-semibold">
            <Phone className="w-3 h-3" />
            614-917-7107
          </a>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-[#002D72]">
              <Globe className="w-3 h-3" />
              EN/USD
            </button>
            <Link href="/dealers/login" className="hover:text-[#002D72]">Dealer Login</Link>
            <button className="hover:text-[#002D72]">Help</button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header key={pathname} className="sticky top-0 z-50 bg-white border-b border-[#dee1e6] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="Shelby Exchange" 
                className="h-[91px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation - moved to center where search was */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <Link href="/listings" className="text-sm font-bold text-[#002D72] uppercase tracking-wider hover:text-[#E31837] transition-colors">
                Browse Inventory
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-3 z-50">
                <div className="min-w-[220px] bg-white border border-[#dee1e6] rounded-lg shadow-lg p-2">
                  {inventoryFilters.map((filter) => (
                    <Link
                      key={filter}
                      href={`/listings?model=${encodeURIComponent(filter)}`}
                      className="block px-3 py-2 rounded-md text-xs font-bold text-[#565d6d] uppercase tracking-wider hover:bg-[#f3f4f6] hover:text-[#002D72] transition-colors"
                    >
                      {filter}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-px h-5 bg-[#dee1e6]" />
            <Link href="/sell" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">How It Works</Link>
            <Link href="/featured" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Featured</Link>
            <Link href="/blog" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Articles</Link>
            <Link href="/dealers" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">For Dealers</Link>
            <div className="relative group">
              <Link href="/about" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">
                About
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-3 z-50">
                <div className="min-w-[170px] bg-white border border-[#dee1e6] rounded-lg shadow-lg p-2">
                  <Link href="/about" className="block px-3 py-2 rounded-md text-xs font-bold text-[#565d6d] uppercase tracking-wider hover:bg-[#f3f4f6] hover:text-[#002D72] transition-colors">
                    About
                  </Link>
                  <Link href="/contact" className="block px-3 py-2 rounded-md text-xs font-bold text-[#565d6d] uppercase tracking-wider hover:bg-[#f3f4f6] hover:text-[#002D72] transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sell" className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#E31837] text-white text-sm font-bold rounded-md hover:bg-[#c41530] transition-colors shadow-sm">
              Sell Your Shelby
            </Link>
            <div className="h-8 w-px bg-[#dee1e6] hidden lg:block" />
            <button className="p-2 text-[#565d6d] hover:text-[#E31837]">
              <Heart className="w-5 h-5" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="relative group">
                  <div className="w-9 h-9 rounded-full bg-[#002D72] border-2 border-[#002D72] flex items-center justify-center cursor-pointer overflow-hidden text-white font-bold text-sm hover:bg-[#001D4A] transition-colors">
                    {getUserInitials()}
                  </div>
                </Link>
                <button 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="p-2 text-[#565d6d] hover:text-[#E31837] transition-colors"
                  title="Sign Out"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              <Link href="/login" className="relative">
                <div className="w-9 h-9 rounded-full bg-[#002D72]/10 border border-[#002D72]/20 flex items-center justify-center cursor-pointer overflow-hidden text-[#002D72] font-bold text-sm hover:bg-[#002D72]/20 transition-colors">
                  <User className="w-5 h-5" />
                </div>
              </Link>
            )}
            
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#f3f4f6] px-5 py-6 space-y-4">
            <Link href="/listings" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold text-[#002D72] uppercase tracking-wider">Browse Inventory</Link>
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#565d6d]">Quick Filters</span>
              <div className="grid grid-cols-2 gap-2">
                {inventoryFilters.map((filter) => (
                  <Link
                    key={filter}
                    href={`/listings?model=${encodeURIComponent(filter)}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-2 py-1.5 border border-[#dee1e6] rounded text-[11px] font-semibold text-[#002D72] text-center"
                  >
                    {filter}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/sell" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">How It Works</Link>
            <Link href="/featured" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Featured</Link>
            <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Articles</Link>
            <Link href="/dealers" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">For Dealers</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">About</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d] pl-3">Contact Us</Link>
            <Link href="/sell" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 bg-[#E31837] text-white text-sm font-bold rounded-md text-center">Sell Your Shelby</Link>
            <a href="tel:6149177107" className="flex items-center justify-center gap-2 py-3 border border-[#E31837] text-[#E31837] text-sm font-bold rounded-md">
              <Phone className="w-4 h-4" />
              614-917-7107
            </a>
            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">My Profile</Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full py-3 border border-[#E31837] text-[#E31837] text-sm font-bold rounded-md text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Sign In</Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 bg-[#002D72] text-white text-sm font-bold rounded-md text-center">Create Account</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
