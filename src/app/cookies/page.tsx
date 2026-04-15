import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Shelby Exchange",
  description: "Cookie Policy for Shelby Exchange Marketplace",
};

export default function CookiePolicyPage() {
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
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#E31837] uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-outfit font-black text-3xl sm:text-4xl tracking-tighter mb-3">Cookie Policy</h1>
          <p className="text-[#565d6d]">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">What Are Cookies</h2>
            <p className="text-[#565d6d] leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to website owners. 
              Cookies help us improve your browsing experience by remembering your preferences and understanding how you use our Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">How We Use Cookies</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Shelby Exchange uses cookies for several purposes:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>To enable essential functions of our Platform</li>
              <li>To remember your preferences and settings</li>
              <li>To understand how visitors interact with our website</li>
              <li>To improve our services and user experience</li>
              <li>To maintain the security of your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="bg-[#fafafb] rounded-xl p-6 border border-[#dee1e6]">
                <h3 className="font-bold text-lg text-[#171a1f] mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Essential Cookies
                </h3>
                <p className="text-[#565d6d] leading-relaxed mb-3">
                  These cookies are necessary for the Platform to function properly. They enable core functionality 
                  such as security, network management, and account access. You cannot opt out of these cookies.
                </p>
                <ul className="list-disc list-inside text-sm text-[#565d6d] space-y-1 ml-4">
                  <li>Authentication and session management</li>
                  <li>Security features and fraud prevention</li>
                  <li>Load balancing and server routing</li>
                </ul>
              </div>

              <div className="bg-[#fafafb] rounded-xl p-6 border border-[#dee1e6]">
                <h3 className="font-bold text-lg text-[#171a1f] mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Preference Cookies
                </h3>
                <p className="text-[#565d6d] leading-relaxed mb-3">
                  These cookies allow us to remember choices you make and provide enhanced, personalized features. 
                  They may be set by us or third-party providers.
                </p>
                <ul className="list-disc list-inside text-sm text-[#565d6d] space-y-1 ml-4">
                  <li>Language and region preferences</li>
                  <li>Display and layout preferences</li>
                  <li>Recently viewed listings</li>
                  <li>Saved searches and filters</li>
                </ul>
              </div>

              <div className="bg-[#fafafb] rounded-xl p-6 border border-[#dee1e6]">
                <h3 className="font-bold text-lg text-[#171a1f] mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  Analytics Cookies
                </h3>
                <p className="text-[#565d6d] leading-relaxed mb-3">
                  These cookies help us understand how visitors interact with our Platform by collecting and reporting 
                  information anonymously. This helps us improve our website.
                </p>
                <ul className="list-disc list-inside text-sm text-[#565d6d] space-y-1 ml-4">
                  <li>Pages visited and time spent</li>
                  <li>Traffic sources and referrals</li>
                  <li>Error reporting and debugging</li>
                  <li>Feature usage patterns</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Third-Party Cookies</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Some cookies are placed by third-party services that appear on our pages. These include:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Supabase:</strong> For authentication and data storage</li>
              <li><strong>Vercel:</strong> For hosting and performance optimization</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              These third parties have their own privacy and cookie policies. We encourage you to review them.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Managing Cookies</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              You can control and manage cookies in various ways:
            </p>
            
            <h3 className="font-bold text-lg text-[#171a1f] mb-3 mt-6">Browser Settings</h3>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li>View cookies stored on your device</li>
              <li>Delete individual cookies or all cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies</li>
              <li>Receive notifications when cookies are being set</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              Please note that disabling cookies may affect the functionality of our Platform and your user experience.
            </p>

            <h3 className="font-bold text-lg text-[#171a1f] mb-3 mt-6">Cookie Management Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="https://support.google.com/chrome/answer/95647" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-[#fafafb] rounded-lg border border-[#dee1e6] hover:border-[#002D72] transition-colors"
              >
                <p className="font-medium text-[#171a1f]">Google Chrome</p>
                <p className="text-sm text-[#565d6d]">Cookie settings</p>
              </a>
              <a 
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-[#fafafb] rounded-lg border border-[#dee1e6] hover:border-[#002D72] transition-colors"
              >
                <p className="font-medium text-[#171a1f]">Mozilla Firefox</p>
                <p className="text-sm text-[#565d6d]">Privacy settings</p>
              </a>
              <a 
                href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-[#fafafb] rounded-lg border border-[#dee1e6] hover:border-[#002D72] transition-colors"
              >
                <p className="font-medium text-[#171a1f]">Safari</p>
                <p className="text-sm text-[#565d6d]">Privacy settings</p>
              </a>
              <a 
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-[#fafafb] rounded-lg border border-[#dee1e6] hover:border-[#002D72] transition-colors"
              >
                <p className="font-medium text-[#171a1f]">Microsoft Edge</p>
                <p className="text-sm text-[#565d6d]">Cookie settings</p>
              </a>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Cookie Duration</h2>
            <p className="text-[#565d6d] leading-relaxed mb-4">
              Cookies can remain on your device for different periods:
            </p>
            <ul className="list-disc list-inside text-[#565d6d] space-y-2 ml-4">
              <li><strong>Session Cookies:</strong> These are temporary and expire when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> These remain on your device until they expire or you delete them</li>
            </ul>
            <p className="text-[#565d6d] leading-relaxed mt-4">
              Most of our cookies expire within 12 months, though some may persist longer for security and preference purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Changes to This Policy</h2>
            <p className="text-[#565d6d] leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. 
              We encourage you to review this page periodically for the latest information on our cookie practices.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-outfit font-bold text-2xl text-[#171a1f] mb-4">Contact Us</h2>
            <p className="text-[#565d6d] leading-relaxed">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
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
