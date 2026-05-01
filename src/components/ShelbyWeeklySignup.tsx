"use client";

import { useState } from "react";
import { subscribeClientEmail } from "@/lib/klaviyo/client";

export function ShelbyWeeklySignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const result = await subscribeClientEmail(email, "homepage_inline");
    setLoading(false);

    if (!result.ok) {
      setError("We couldn't subscribe that email. Please try again.");
      return;
    }

    setDone(true);
    setEmail("");
  };

  if (done) {
    return <p className="text-xs font-bold text-green-700">Thanks! You are on the list.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="w-full md:max-w-xs">
      <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="min-w-0 flex-1 h-12 px-4 rounded-md border border-[#dee1e6] bg-white text-sm outline-none focus:border-[#002D72]"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-5 bg-[#002D72] text-white text-sm font-bold rounded-md hover:bg-[#001D4A] transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Subscribe"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[10px] font-medium text-red-600">{error}</p> : null}
    </form>
  );
}
