"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle,
  CheckCircle, Eye, Image as ImageIcon, Users, DollarSign,
  Package, ArrowUpRight, Trash2,
  Layout, Type, Palette, Loader2, Car, Calendar
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/supabase/database.types";
import { trackClientEvent } from "@/lib/klaviyo/client";

interface ListingWithDetails extends Listing {
  seller_name: string;
  seller_type: "private" | "dealer";
  primary_image_url: string | null;
  dealership_name: string | null;
  date_display: string;
}

const quickActions = [
  { label: "Edit Homepage", href: "/admin/content", icon: Layout, desc: "Hero, featured listings, content" },
  { label: "Manage Media", href: "/admin/media", icon: ImageIcon, desc: "Upload and organize images" },
  { label: "Create Article", href: "/admin/news", icon: Type, desc: "News, reviews, guides" },
  { label: "Site Settings", href: "/admin/settings", icon: Palette, desc: "Colors, branding, SEO" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    featured: 0,
    userAccounts: 0,
    revenueMonthlyCents: null as number | null,
  });
  
  const supabase = createClient();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/admin/dashboard", { signal: controller.signal });
      clearTimeout(timeout);

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to load dashboard");
      }

      const listingsWithDetails: ListingWithDetails[] = (result.data || []).map((listing: any) => ({
        ...listing,
        date_display: getTimeAgo(listing.created_at),
      }));

      setListings(listingsWithDetails);
      setStats(result.stats || { total: 0, pending: 0, active: 0, featured: 0, userAccounts: 0, revenueMonthlyCents: null });
    } catch (error: any) {
      console.error("Error loading listings:", error);
      // Set empty state on error to prevent infinite loading
      setListings([]);
      setStats({ total: 0, pending: 0, active: 0, featured: 0, userAccounts: 0, revenueMonthlyCents: null });
    }
    setLoading(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ 
          status: "ACTIVE",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      const listing = listings.find((l) => l.id === id);
      if (listing) {
        void trackClientEvent({
          event: "Listing approved",
          profile: { external_id: listing.user_id },
          properties: {
            listing_id: listing.id,
            vehicle_name: `${listing.year} ${listing.make} ${listing.model}`,
            year: listing.year,
            make: listing.make,
            model: listing.model,
            trim: listing.trim,
            price: listing.price,
            image: listing.primary_image_url,
            url: `${window.location.origin}/listings/${listing.id}`,
            location: listing.location,
          },
        });
      }
      await loadListings();
    } catch (error) {
      console.error("Error approving listing:", error);
      alert("Failed to approve listing");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "sold": return "bg-[#002D72] text-white";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "homepage_plus_ads": return "bg-[#002D72] text-white";
      case "homepage": return "bg-[#002D72] text-white";
      case "standard": return "bg-gray-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  };

  const getChangeBadgeClass = (change: string) => {
    if (change.startsWith("+")) return "bg-green-100 text-green-700";
    if (change.startsWith("-")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  // Filter listings based on active tab
  const filteredListings = listings.filter(listing => {
    if (activeTab === "pending") return listing.status === "PENDING";
    if (activeTab === "featured") return listing.is_featured;
    return true; // overview shows all
  });

  // Calculate tab counts
  const pendingCount = listings.filter(l => l.status === "PENDING").length;
  const featuredCount = listings.filter(l => l.is_featured).length;

  const statsData = [
    { label: "Total Listings", value: stats.total.toString(), change: "+12%", icon: Package, color: "blue" },
    { label: "Pending Review", value: stats.pending.toString(), change: "+3", icon: AlertTriangle, color: "yellow" },
    { label: "Active Users", value: stats.userAccounts.toLocaleString(), change: "Account Count", icon: Users, color: "green" },
    {
      label: "Revenue (Mo)",
      value: stats.revenueMonthlyCents === null ? "--" : formatPrice(stats.revenueMonthlyCents / 100),
      change: stats.revenueMonthlyCents === null ? "Stripe Live Required" : "Stripe",
      icon: DollarSign,
      color: "red",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your marketplace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                stat.color === "yellow" ? "bg-yellow-100 text-yellow-600" :
                stat.color === "green" ? "bg-green-100 text-green-600" :
                "bg-[#E31837]/10 text-[#E31837]"
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getChangeBadgeClass(stat.change)}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link 
              key={action.label}
              href={action.href}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#002D72] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#002D72] group-hover:text-white transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#002D72]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            {[
              { id: "overview", label: "Recent Activity" },
              { id: "pending", label: "Pending Review", count: pendingCount },
              { id: "featured", label: "Homepage Featured", count: featuredCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "bg-[#002D72] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? "bg-white/20" : "bg-[#E31837] text-white"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#002D72] mx-auto mb-4" />
            <p className="text-gray-500">Loading listings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={listing.primary_image_url || "/images/logo.png"} 
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/logo.png';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {listing.year} {listing.make} {listing.model}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{listing.vin}</div>
                          <div className="text-sm font-bold text-[#E31837]">{formatPrice(listing.price)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{listing.seller_name}</div>
                      {listing.seller_type === "dealer" && (
                        <span className="inline-block px-1.5 py-0.5 bg-[#002D72] text-white text-[10px] font-bold rounded mt-1">
                          DEALER
                        </span>
                      )}
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {listing.date_display}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                        getPackageColor(listing.package_tier)
                      }`}>
                        {listing.package_tier.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        getStatusColor(listing.status)
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          listing.status === 'PENDING' ? 'bg-yellow-500' :
                          listing.status === 'ACTIVE' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`} />
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Detail */}
                        <Link
                          href={`/admin/listings/${listing.id}`}
                          className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* Approve - Only for pending */}
                        {listing.status === "PENDING" && (
                          <button 
                            onClick={() => handleApprove(listing.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Listing"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* View Live */}
                        <Link
                          href={`/listings/${listing.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Live Page"
                        >
                          <Car className="w-4 h-4" />
                        </Link>
                        
                        {/* Delete */}
                        <button 
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 text-gray-400 hover:text-[#E31837] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredListings.length === 0 && !loading && (
          <div className="p-16 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No items to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
