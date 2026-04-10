import Link from "next/link";
import { ArrowLeft, Scale, Shield, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Shelby Exchange",
  description: "Terms of Service for Shelby Exchange Marketplace",
};

export default function TermsOfServicePage() {
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#fafafb] border-b border-[#dee1e6]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-[#565d6d] hover:text-[#002D72] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#002D72] rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl tracking-tighter mb-3">Terms of Service</h1>
          <p className="text-[#565d6d]">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              By accessing or using the Shelby Exchange marketplace (&quot;Platform&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
            <p className="text-[#565d6d] leading-relaxed">
              Shelby Exchange reserves the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the Platform constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">2. Platform Description</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Shelby Exchange operates as an online marketplace connecting buyers and sellers of Ford Shelby vehicles. 
              We provide a platform for advertising vehicles but do not participate in transactions between users.
            </p>
            <div className="bg-[#fafafb] border border-[#dee1e6] rounded-xl p-6 my-6">
              <p className="text-sm text-[#565d6d] leading-relaxed">
                <strong className="text-[#171a1f]">Important:</strong> Shelby Exchange is an independent marketplace and is not affiliated with, 
                sponsored by, or endorsed by Ford Motor Company or Carroll Shelby Licensing. We are an advertising platform only; 
                all transactions are peer-to-peer between buyers and sellers.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">3. User Accounts</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your account information if changes occur</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Be at least 18 years old to create an account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">4. Listing Requirements</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              When creating vehicle listings, sellers agree to:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Provide accurate vehicle information including VIN, mileage, condition, and history</li>
              <li>Upload only authentic photos of the actual vehicle</li>
              <li>Disclose any known defects, accidents, or title issues</li>
              <li>Set realistic and honest asking prices</li>
              <li>Respond to inquiries in a timely manner</li>
              <li>Honor the terms of any agreed-upon sale</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              Shelby Exchange reserves the right to remove listings that violate these requirements or are deemed fraudulent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">5. Fees and Payments</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Listing fees are charged at the time of posting and are non-refundable except in cases of Platform error. 
              Subscription plans for dealers auto-renew monthly unless cancelled.
            </p>
            <p className="text-[#565d6d] leading-relaxed">
              All payments are processed securely through Stripe. Shelby Exchange does not store credit card information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">6. Prohibited Activities</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Users may not:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>List non-Shelby vehicles or vehicles without proper title</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Use the Platform for illegal activities</li>
              <li>Attempt to circumvent Platform fees or communication systems</li>
              <li>Harass, threaten, or discriminate against other users</li>
              <li>Upload malware, viruses, or harmful code</li>
              <li>Scrape or data-mine the Platform without permission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">7. Disclaimers and Limitations</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Shelby Exchange provides the Platform &quot;as is&quot; without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>The accuracy of any listing information</li>
              <li>The quality or condition of vehicles listed</li>
              <li>The legitimacy of any user or transaction</li>
              <li>Continuous, uninterrupted access to the Platform</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              Buyers are strongly encouraged to conduct independent inspections and verify all vehicle information before purchase.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">8. Limitation of Liability</h2>
            <p className="text-[#565d6d] leading-relaxed">
              Shelby Exchange shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              arising from your use of the Platform. Our total liability shall not exceed the amount you paid to use 
              our services in the twelve months preceding any claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">9. Governing Law</h2>
            <p className="text-[#565d6d] leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, 
              without regard to its conflict of law provisions. Any disputes shall be resolved in the courts located 
              in Los Angeles County, California.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">10. Contact Information</h2>
            <p className="text-[#565d6d] leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-[#fafafb] rounded-xl border border-[#dee1e6]">
              <p className="text-[#171a1f] font-medium">Shelby Exchange</p>
              <p className="text-[#565d6d]">Email: legal@shelbyexchange.com</p>
              <p className="text-[#565d6d]">Address: Los Angeles, CA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
