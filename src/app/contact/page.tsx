"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const REASONS = [
  "General Inquiry",
  "Listing Support",
  "Account Issue",
  "Billing / Payment",
  "Dealer Program",
  "Report a Problem",
  "Other",
];

export default function ContactPage() {
  const { user, profile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || user.email || "");
      setPhone(profile.phone || "");
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          reason,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to send message");
      }

      setSent(true);
    } catch (err: any) {
      console.error("Contact submission error:", err);
      alert(err.message || "Failed to send message. Please try again.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-outfit font-black mb-3">Message Sent!</h1>
          <p className="text-[#565d6d] mb-8">We&apos;ll get back to you within 24 hours.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#565d6d] hover:text-[#002D72] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-outfit font-black tracking-tight mb-2">Contact Us</h1>
        <p className="text-[#565d6d] text-lg mb-10">Have a question or need help? Fill out the form below and we&apos;ll get back to you shortly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason *</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none">
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none resize-none" placeholder="How can we help you?" />
              </div>

              <button type="submit" disabled={sending} className="w-full md:w-auto px-10 py-4 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#fafafb] rounded-2xl p-8 border border-[#dee1e6] sticky top-24">
              <h3 className="font-outfit font-bold text-lg mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <a href="https://fordshelbyforsale.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-[#002D72]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#002D72]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#002D72]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#565d6d] uppercase tracking-wider mb-1">Website</span>
                    <span className="text-sm font-bold text-[#002D72] group-hover:underline">fordshelbyforsale.com</span>
                  </div>
                </a>
                <a href="tel:6149177107" className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-[#E31837]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#E31837]/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E31837]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#565d6d] uppercase tracking-wider mb-1">Phone</span>
                    <span className="text-sm font-bold text-[#E31837] group-hover:underline">614-917-7107</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
