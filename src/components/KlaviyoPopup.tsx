"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { subscribeClientEmail } from "@/lib/klaviyo/client";

export function KlaviyoPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("klaviyo_popup_dismissed");
    if (dismissed === "1") return;

    const t = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    localStorage.setItem("klaviyo_popup_dismissed", "1");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const result = await subscribeClientEmail(email, "popup_offer");
    setLoading(false);
    if (!result.ok) return;
    setDone(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={close} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-outfit font-black text-2xl mb-2">Get New Shelby Listings Before Anyone Else</h3>
        <p className="text-sm text-[#565d6d] mb-4">Enter your email to get alerts.</p>

        {done ? (
          <div className="text-sm font-semibold text-green-700">You are subscribed. Watch your inbox.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-11 px-4 rounded-xl border border-[#dee1e6] outline-none focus:border-[#002D72]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#002D72] text-white font-bold hover:bg-[#001D4A] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Get Alerts"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
