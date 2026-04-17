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
                className="h-[70px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation - moved to center where search was */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-sm font-bold text-[#002D72] uppercase tracking-wider hover:text-[#E31837] transition-colors">Browse Inventory</Link>
            <div className="w-px h-5 bg-[#dee1e6]" />
            <a href="/#how-it-works" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">How It Works</a>
            <Link href="/featured" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Featured</Link>
            <Link href="/blog" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Articles</Link>
            <a href="/#testimonials" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Testimonials</a>
            <Link href="/dealers" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">Dealers</Link>
            <Link href="/about" className="text-xs font-bold text-[#565d6d] uppercase tracking-widest hover:text-[#002D72] transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sell" className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#E31837] text-white text-sm font-bold rounded-md hover:bg-[#c41530] transition-colors shadow-sm">
              Sell Your Shelby
            </Link>
            <a href="tel:6149177107" className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-[#E31837] hover:text-[#c41530] transition-colors">
              <Phone className="w-4 h-4" />
              614-917-7107
            </a>
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
            <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">How It Works</a>
            <Link href="/featured" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Featured</Link>
            <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Articles</Link>
            <a href="/#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Testimonials</a>
            <Link href="/dealers" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">Dealers</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-sm font-medium text-[#565d6d]">About</Link>
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
