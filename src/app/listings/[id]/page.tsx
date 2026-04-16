"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Share2, Calendar, Gauge, Zap, Palette, ShieldCheck, Copy, Check, Star, MapPin, Phone, MessageSquare, Loader2, Printer } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareModal } from "@/components/ShareModal";
import { useAuth } from "@/contexts/AuthContext";
import { trackClientEvent } from "@/lib/klaviyo/client";
import { KlaviyoInlineForm } from "@/components/KlaviyoInlineForm";

interface ListingDetail {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number;
  description: string;
  transmission: string;
  drivetrain: string;
  engine: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  location: string | null;
  vin: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string | null;
  seller_avatar: string | null;
  dealership_name: string | null;
  seller_rating: number | null;
  images: { url: string; is_primary: boolean }[];
  features: string[];
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeThumb, setActiveThumb] = useState(0);
  const [copied, setCopied] = useState(false);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [leadWallEnabled, setLeadWallEnabled] = useState(true);
  
  const listingId = params.id as string;

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (!listing) return;

    void trackClientEvent({
      event: "Viewed listing",
      profile: {
        email: user?.email,
        external_id: user?.id,
      },
      properties: {
        listing_id: listing.id,
        vehicle_name: `${listing.year} ${listing.make} ${listing.model}`,
        year: listing.year,
        make: listing.make,
        model: listing.model,
        trim: listing.trim,
        price: listing.price,
        image: listing.images?.[0]?.url || null,
        url: typeof window !== "undefined" ? window.location.href : null,
        location: listing.location,
      },
    });
  }, [listing, user?.email, user?.id]);

  useEffect(() => {
    const loadLeadWallSetting = async () => {
      try {
        const res = await fetch('/api/settings/public?keys=lead_wall_enabled');
        if (!res.ok) return;
        const payload = await res.json();
        const value = payload?.data?.lead_wall_enabled;
        if (typeof value === 'boolean') {
          setLeadWallEnabled(value);
        }
      } catch {
        // Keep secure default on network errors
      }
    };

    void loadLeadWallSetting();
  }, []);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`/api/listings/${listingId}`, { signal: controller.signal });
      clearTimeout(timeout);

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || 'Failed to load listing');
      }

      setListing(payload.data as ListingDetail);
    } catch (err: unknown) {
      console.error('Error fetching listing:', err);
      setError(err instanceof Error ? err.message : "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const copyVin = () => { 
    if (listing?.vin) {
      navigator.clipboard.writeText(listing.vin); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000); 
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/listing-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          seller_id: listing.user_id,
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to send inquiry');
      }

      setContactSent(true);
      setTimeout(() => {
        setShowContactModal(false);
        setContactSent(false);
        setContactForm({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error sending inquiry:', err);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#002D72] mx-auto mb-4" />
          <p className="text-[#565d6d] font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-[#565d6d] mb-6">{error || "This listing doesn't exist or has been removed."}</p>
          <Link href="/listings" className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-lg">
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  const car = listing;
  const primaryImage = car.images.find(img => img.is_primary)?.url || car.images[0]?.url || '/images/logo.png';
  const otherImages = car.images.filter(img => !img.is_primary).map(img => img.url);
  const allImages = [primaryImage, ...otherImages].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Contact Seller</h3>
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {contactSent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold mb-2">Message Sent!</h4>
                <p className="text-gray-600">The seller will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Phone</label>
                  <input 
                    type="tel"
                    value={contactForm.phone}
                    onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Message *</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none resize-none"
                    placeholder={`I'm interested in the ${car.year} ${car.make} ${car.model}. Please contact me with more information.`}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="w-full py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-4 lg:px-16 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#565d6d] mb-6">
          <Link href="/listings" className="hover:text-[#002D72]">Inventory</Link><ChevronRight className="w-3 h-3" />
          <span>{car.make}</span><ChevronRight className="w-3 h-3" />
          <span>{car.model}</span><ChevronRight className="w-3 h-3" />
          <span className="font-medium text-[#171a1f]">{car.trim || 'Standard'}</span>
        </nav>

        {/* Title & Price */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-4 break-words">
              {car.year} {car.make} {car.model} {car.trim || ''}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              {car.is_featured && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#002D72]/10 border border-[#002D72]/20 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-[#002D72]" /><span className="text-xs font-semibold text-[#002D72]">Featured Listing</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-[#565d6d]">
                <Calendar className="w-4 h-4" />
                <span>Listed {new Date(car.created_at).toLocaleDateString()}</span>
              </div>
              <FavoriteButton listingId={car.id} showLabel />
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 text-sm text-[#565d6d] hover:text-[#002D72]"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-sm text-[#565d6d] hover:text-[#002D72] print:hidden"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-3xl md:text-4xl font-outfit font-black text-[#E31837]">
              ${car.price.toLocaleString()}
            </div>
            <div className="text-sm text-[#565d6d] font-medium mt-1">
              {car.mileage.toLocaleString()} miles
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full bg-[#f3f4f6] rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={allImages[activeThumb] || '/images/logo.png'} 
                  alt={`${car.year} ${car.make} ${car.model}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.png'; }}
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveThumb(idx)} 
                      className={`flex-shrink-0 w-32 h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${idx === activeThumb ? 'border-[#002D72]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Gauge, label: "MILEAGE", value: `${car.mileage.toLocaleString()} mi` },
                { icon: Zap, label: "TRANSMISSION", value: car.transmission },
                { icon: Zap, label: "DRIVETRAIN", value: car.drivetrain },
                { icon: Palette, label: "EXTERIOR", value: car.exterior_color || 'Not specified' },
              ].map((spec, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-soft border border-[#f3f4f6] min-w-0 overflow-hidden">
                  <spec.icon className="w-5 h-5 mb-3 text-[#002D72] shrink-0" />
                  <div className="text-[10px] font-bold tracking-wider text-[#565d6d] uppercase mb-1">{spec.label}</div>
                  <div className="text-sm font-semibold leading-tight break-words">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <section>
                <h2 className="text-2xl font-outfit font-bold mb-4">Seller&apos;s Description</h2>
                <div className="text-[#565d6d] leading-relaxed whitespace-pre-wrap">
                  {car.description}
                </div>
              </section>
            )}

            {/* Features */}
            {car.features.length > 0 && (
              <section>
                <h2 className="text-2xl font-outfit font-bold mb-6">Key Features &amp; Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {car.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f3f4f6]">
                      <Check className="w-4 h-4 text-[#002D72]" /><span className="text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VIN */}
            <div className="bg-[#fafafb] p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#565d6d]">VIN: {car.vin}</span>
                <button onClick={copyVin} className="flex items-center gap-1 text-xs font-bold text-[#002D72] hover:underline">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy VIN"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-soft border-t-4 border-[#002D72] p-6 overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#002D72]/10">
                    <img 
                      src={car.seller_avatar || '/images/logo.png'} 
                      alt={car.seller_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.png'; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-outfit font-bold">{car.dealership_name || car.seller_name}</h3>
                    {car.seller_rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold">{car.seller_rating}</span>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <button 
                    onClick={() => {
                      void trackClientEvent({
                        event: "Contact seller",
                        profile: {
                          email: user?.email,
                          external_id: user?.id,
                        },
                        properties: {
                          listing_id: car.id,
                          vehicle_name: `${car.year} ${car.make} ${car.model}`,
                          year: car.year,
                          make: car.make,
                          model: car.model,
                          trim: car.trim,
                          price: car.price,
                          image: car.images?.[0]?.url || null,
                          url: typeof window !== "undefined" ? window.location.href : null,
                          location: car.location,
                        },
                      });

                      if (leadWallEnabled && !user) {
                        router.push(`/login?redirect=/listings/${listingId}`);
                        return;
                      }
                      setShowContactModal(true);
                    }}
                    className="w-full h-12 bg-[#002D72] text-white font-bold rounded-md flex items-center justify-center gap-3 hover:bg-[#001D4A] transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" /> {leadWallEnabled && !user ? "Create Account to Contact Seller" : "Email Seller"}
                  </button>
                  {car.seller_phone && (
                    !leadWallEnabled || user ? (
                      <a 
                        href={`tel:${car.seller_phone}`}
                        className="w-full h-12 bg-white border border-[#dee1e6] font-semibold rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-5 h-5" /> {car.seller_phone}
                      </a>
                    ) : (
                      <button
                        onClick={() => router.push(`/login?redirect=/listings/${listingId}`)}
                        className="w-full h-12 bg-white border border-[#dee1e6] font-semibold rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-5 h-5" /> {car.seller_phone.slice(0, 4)}••• (login to view)
                      </button>
                    )
                  )}
                </div>
                {leadWallEnabled && !user ? (
                  <div className="mb-6 p-4 rounded-lg border border-[#E31837]/20 bg-[#E31837]/5">
                    <p className="text-sm font-semibold text-[#171a1f]">Lead Wall</p>
                    <p className="text-xs text-[#565d6d] mt-1">Create a free account to unlock seller contact details and get priority alerts.</p>
                  </div>
                ) : null}
                <div className="mb-6 p-4 rounded-lg border border-[#dee1e6] bg-[#fafafb]">
                  <p className="text-xs text-[#565d6d] leading-relaxed">
                    Ford ShelbyForSale.com is a marketplace platform that connects buyers and sellers. We do not own, inspect, or sell any vehicles listed on this site. All transactions occur directly between buyer and seller.
                  </p>
                </div>
                <div className="pt-6 border-t border-[#f3f4f6] space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#565d6d]">
                    <MapPin className="w-3 h-3" /> {car.location || 'Location not specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <KlaviyoInlineForm
            title="Get Weekly Shelby Deals & Listings"
            description="Track listing drops and rare specs before they sell."
            source="listing_inline"
          />
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={`${car.year} ${car.make} ${car.model} for Sale`}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={`Check out this ${car.year} ${car.make} ${car.model} with ${car.mileage.toLocaleString()} miles for $${car.price.toLocaleString()}`}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header, footer, .print\\:hidden, button, nav {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 !important;
          }
          img {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
