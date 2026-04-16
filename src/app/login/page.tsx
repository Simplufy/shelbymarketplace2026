"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('Attempting login with:', email);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      console.error('Login error:', signInError);
      
      // Provide user-friendly error messages
      let errorMessage = signInError.message;
      if (signInError.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (signInError.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in. Check your inbox for the confirmation link.';
      } else if (signInError.message.includes('too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    console.log('Login successful');
    setTimeout(() => {
      window.location.assign(redirect);
    }, 150);
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f]">Password</label>
            <Link href="/forgot-password" className="text-[11px] font-bold text-[#E31837] hover:underline uppercase tracking-wider">Forgot?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 pl-12 pr-12 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#565d6d] hover:text-[#002D72]">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-[#dee1e6] accent-[#002D72]" />
          <span className="text-sm text-[#565d6d]">Remember me for 30 days</span>
        </label>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors shadow-lg shadow-[#002D72]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-[#565d6d]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[#002D72] hover:underline">Create one</Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/dealers/login" className="text-xs font-bold text-[#E31837] uppercase tracking-widest hover:underline">Dealer Login →</Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#002D72] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002D72] via-[#001D4A] to-[#000D2A]" />
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(ellipse_at_bottom_right,_#E3183733_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="w-16 h-16 bg-[#E31837] rounded-2xl flex items-center justify-center mb-12">
            <span className="text-white font-black text-3xl">S</span>
          </div>
          <h2 className="text-white font-outfit font-black text-4xl sm:text-5xl leading-tight tracking-tighter mb-6 uppercase break-words">
            Welcome<br />Back.
          </h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            Sign in to access your saved listings, track vehicle history reports, and connect with verified Shelby sellers.
          </p>
          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#002D72] flex items-center justify-center text-white/70 text-xs font-bold">{i}</div>
              ))}
            </div>
            <p className="text-white/50 text-sm">2,400+ verified members</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-[#002D72] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="font-heading text-xl font-bold text-[#002D72] tracking-tighter">Shelby Exchange</span>
          </div>

          <h1 className="text-3xl font-outfit font-black tracking-tight mb-2">Sign In</h1>
          <p className="text-[#565d6d] mb-10">Enter your credentials to access your account.</p>

          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
