"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Search, Heart, Menu, X, User, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchPlaceholder } from "@/hooks/useSearchPlaceholder";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const searchPlaceholder = useSearchPlaceholder();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
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
      {/* Top Bar */}
      <div className="bg-[#f3f4f6]/30 py-2 px-4 md:px-8 border-b border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto flex justify-end items-center gap-6 text-[11px] font-medium text-[#565d6d]">
          <button className="flex items-center gap-1 hover:text-[#002D72]">
            <Globe className="w-3 h-3" />
            EN/USD
          </button>
          <Link href="/dealers/login" className="hover:text-[#002D72]">Dealer Login</Link>
          <button className="hover:text-[#002D72]">Help</button>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#dee1e6] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="Shelby Exchange" 
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center bg-[#f3f4f6]/50 rounded-lg px-4 py-2 gap-3 border border-transparent focus-within:border-[#002D72] focus-within:bg-white transition-all">
            <Search className="w-5 h-5 text-[#565d6d]" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-[#565d6d]"
            />
            <div className="h-6 w-px bg-[#dee1e6] mx-2" />
            <button type="submit" className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap hover:text-[#002D72]">
              Search
            </button>
          </form>

          <div className="flex items-center gap-4">
            <Link href="/sell" className="hidden lg:flex px-4 py-2 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              Sell A Shelby
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

        {/* Sub-navigation */}
        <nav className="hidden md:block border-t border-[#f3f4f6]">
          <div className="max-w-[1440px] mx-auto px-8 flex items-center h-12 gap-8">
            <Link href="/listings" className="relative h-full flex items-center">
              <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">Browse Inventory</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E31837]" />
            </Link>
            <div className="flex items-center h-full gap-8">
              {[
                { label: 'Featured', href: '/' },
                { label: 'News & Reviews', href: '/news' },
                { label: 'Dealers', href: '/dealers' },
                { label: 'About', href: '/about' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="relative h-full flex items-center text-xs font-bold text-[#565d6d] uppercase tracking-widest group hover:text-[#002D72] transition-colors">
                  {item.label}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#002D72] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#f3f4f6] px-4 py-6 space-y-4">
            <Link href="/listings" className="block text-sm font-bold text-[#002D72] uppercase tracking-wider">Browse Inventory</Link>
            <Link href="/news" className="block text-sm font-medium text-[#565d6d]">News & Reviews</Link>
            <Link href="/dealers" className="block text-sm font-medium text-[#565d6d]">Dealers</Link>
            <Link href="/about" className="block text-sm font-medium text-[#565d6d]">About</Link>
            <Link href="/sell" className="block text-sm font-medium text-[#565d6d]">Sell A Shelby</Link>
            {user ? (
              <>
                <Link href="/profile" className="block text-sm font-medium text-[#565d6d]">My Profile</Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full py-3 border border-[#E31837] text-[#E31837] text-sm font-bold rounded-md text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-[#565d6d]">Sign In</Link>
                <Link href="/register" className="block w-full py-3 bg-[#002D72] text-white text-sm font-bold rounded-md text-center">Create Account</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
