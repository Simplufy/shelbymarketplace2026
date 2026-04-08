"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, firstName, lastName);

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#002D72] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002D72] via-[#001D4A] to-[#000D2A]" />
        <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-[radial-gradient(ellipse_at_top_left,_#E3183720_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="w-16 h-16 bg-[#E31837] rounded-2xl flex items-center justify-center mb-12">
            <span className="text-white font-black text-3xl">S</span>
          </div>
          <h2 className="text-white font-outfit font-black text-4xl sm:text-5xl leading-tight tracking-tighter mb-6 uppercase break-words">
            Join The<br />Exchange.
          </h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            Create your free account to save vehicles, unlock VIN history reports, and contact verified sellers directly.
          </p>
          <div className="mt-16 space-y-4">
            {['Access full vehicle history & VIN reports', 'Save and compare your favorite listings', 'Get notified when new Shelbys are listed'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E31837]/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#E31837]" /></div>
                <span className="text-white/70 text-sm">{benefit}</span>
              </div>
            ))}
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

          <h1 className="text-3xl font-outfit font-black tracking-tight mb-2">Create Account</h1>
          <p className="text-[#565d6d] mb-10">Get started with your free Shelby Exchange account.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                  <input 
                    type="text" 
                    placeholder="John" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                />
              </div>
            </div>

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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 pl-12 pr-12 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#565d6d] hover:text-[#002D72]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565d6d]" />
                <input 
                  type="password" 
                  placeholder="Re-enter password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#dee1e6] accent-[#002D72] mt-0.5"
              />
              <span className="text-xs text-[#565d6d] leading-relaxed">
                I agree to the <Link href="/terms" className="font-bold text-[#002D72] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-bold text-[#002D72] hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors shadow-lg shadow-[#002D72]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#565d6d]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#002D72] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
