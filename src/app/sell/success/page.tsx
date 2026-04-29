import Link from "next/link";
import { CheckCircle2, Clock, Mail, ArrowRight } from "lucide-react";
import CheckoutReturnHandler from "@/components/sell/CheckoutReturnHandler";

export default function SellSuccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-5 py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mb-4 font-outfit text-4xl font-black tracking-tight text-[#171a1f] md:text-5xl">
            Payment Successful
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[#565d6d]">
            Your listing has been submitted and will be reviewed for approval. Once approved, it will appear in the marketplace.
          </p>

          <CheckoutReturnHandler compact />

          <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
            <div className="rounded-xl border border-[#dee1e6] bg-[#fafafb] p-5">
              <Clock className="mb-3 h-5 w-5 text-[#002D72]" />
              <h2 className="mb-1 font-bold text-[#171a1f]">Approval Review</h2>
              <p className="text-sm leading-relaxed text-[#565d6d]">
                Our team checks listing details, photos, and VIN information before publishing.
              </p>
            </div>
            <div className="rounded-xl border border-[#dee1e6] bg-[#fafafb] p-5">
              <Mail className="mb-3 h-5 w-5 text-[#002D72]" />
              <h2 className="mb-1 font-bold text-[#171a1f]">Watch Your Email</h2>
              <p className="text-sm leading-relaxed text-[#565d6d]">
                You will receive updates if we need anything else or when your listing goes live.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002D72] px-6 py-3 font-bold text-white transition-colors hover:bg-[#001D4A]"
            >
              Browse Inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-[#dee1e6] px-6 py-3 font-bold text-[#171a1f] transition-colors hover:bg-[#f3f4f6]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
