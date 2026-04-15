import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Shelby Exchange",
  description: "Privacy Policy for Shelby Exchange Marketplace",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl tracking-tighter mb-3">Privacy Policy</h1>
          <p className="text-[#565d6d]">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Introduction</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Shelby Exchange (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform.
            </p>
            <p className="text-[#565d6d] leading-relaxed">
              By using Shelby Exchange, you consent to the data practices described in this policy. 
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Information We Collect</h2>
            
            <h3 className="font-bold text-lg text-[#171a1f] mb-3 mt-6">Personal Information</h3>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide when using our Platform, including:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Name, email address, and phone number</li>
              <li>Mailing address and location information</li>
              <li>Account credentials and profile information</li>
              <li>Payment and billing information (processed securely through Stripe)</li>
              <li>Vehicle information and photos for listings</li>
              <li>Communications and correspondence with other users</li>
            </ul>

            <h3 className="font-bold text-lg text-[#171a1f] mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              When you access our Platform, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Device and browser information</li>
              <li>IP address and geographic location</li>
              <li>Usage data and browsing patterns</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Referral source and exit pages</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">How We Use Your Information</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Providing and maintaining our marketplace services</li>
              <li>Processing transactions and listing fees</li>
              <li>Facilitating communication between buyers and sellers</li>
              <li>Verifying user identities and preventing fraud</li>
              <li>Sending administrative notifications and marketing communications</li>
              <li>Improving our Platform and user experience</li>
              <li>Complying with legal obligations</li>
              <li>Enforcing our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Information Sharing</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li><strong>With Other Users:</strong> When you create a listing or contact a seller, certain information (like contact details) is shared to facilitate transactions</li>
              <li><strong>Service Providers:</strong> We use third-party services (Stripe for payments, Supabase for data storage) that have access to information necessary to perform their functions</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Data Security</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments</li>
              <li>Access controls and monitoring</li>
              <li>Secure payment processing through PCI-compliant providers</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Your Rights and Choices</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Cookies and Tracking</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our Platform. 
              These help us understand usage patterns, remember your preferences, and improve our services.
            </p>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Types of cookies we use:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for basic Platform functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Platform</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect Platform functionality.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Children&apos;s Privacy</h2>
            <p className="text-[#565d6d] leading-relaxed">
              Our Platform is not intended for use by children under 18 years of age. We do not knowingly collect 
              personal information from children under 18. If we learn we have collected such information, 
              we will promptly delete it.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Data Retention</h2>
            <p className="text-[#565d6d] leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
              unless a longer retention period is required by law. When you delete your account, we will delete or anonymize 
              your personal information within 30 days, except where retention is necessary for legal compliance or dispute resolution.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">International Data Transfers</h2>
            <p className="text-[#565d6d] leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information when transferred internationally, 
              in compliance with applicable data protection laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Changes to This Policy</h2>
            <p className="text-[#565d6d] leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Platform 
              after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Contact Us</h2>
            <p className="text-[#565d6d] leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-6 bg-[#fafafb] rounded-xl border border-[#dee1e6]">
              <p className="text-[#171a1f] font-medium">Shelby Exchange</p>
              <p className="text-[#565d6d]">Email: privacy@shelbyexchange.com</p>
              <p className="text-[#565d6d]">Address: Los Angeles, CA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
