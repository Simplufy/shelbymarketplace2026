"use client";

import { useState } from "react";
import { subscribeClientEmail } from "@/lib/klaviyo/client";

export function KlaviyoInlineForm({
  title,
  source,
  description,
}: {
  title: string;
  source: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await subscribeClientEmail(email, source);
    setLoading(false);
    setDone(true);
    setEmail("");
  };

  return (
    <div className="bg-[#002D72]/5 border border-[#002D72]/20 rounded-2xl p-6">
      <h3 className="font-outfit font-bold text-xl text-[#171a1f] mb-2">{title}</h3>
      {description ? <p className="text-sm text-[#565d6d] mb-4">{description}</p> : null}

      {done ? (
        <p className="text-sm font-semibold text-green-700">Thanks! You are on the list.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            className="flex-1 h-11 px-4 rounded-xl border border-[#dee1e6] bg-white text-sm outline-none focus:border-[#002D72]"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-[#E31837] text-white text-sm font-bold hover:bg-[#c41530] disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}
