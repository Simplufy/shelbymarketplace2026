"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, CheckCircle, XCircle, Eye, Edit2, Trash2,
  Car, DollarSign, User, MapPin, Calendar, Package,
  Loader2
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
  title?: string;
}

export default function AdminListings() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    loadListings();

    const safety = setTimeout(() => {
      setLoading(false);
    }, 12000);

    return () => clearTimeout(safety);
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Listings request timeout")), 8000)
      );

      const queryPromise = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (error) throw error;

      if (data) {
        if (data.length === 0) {
          setListings([]);
          setLoading(false);
          return;
        }

        const listingIds = data.map((l: any) => l.id);
        const userIds = [...new Set(data.map((l: any) => l.user_id))];

        // Fetch with short timeout - don't let it hang forever
        const fetchWithTimeout = async (query: any, label: string) => {
          try {
            const timeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(label + ' timeout')), 5000)
            );
            const result = await Promise.race([query, timeout]);
            return (result as any)?.data || [];
          } catch (err) {
            console.log(label, 'failed:', err.message);
            return [];
          }
        };

        const primaryImages = await fetchWithTimeout(
          supabase.from("listing_images").select("listing_id, url").eq("is_primary", true).in("listing_id", listingIds),
          "Images"
        );
        const profiles = await fetchWithTimeout(
          supabase.from("profiles").select("id, first_name, last_name").in("id", userIds),
          "Profiles"  
        );
        const dealers = await fetchWithTimeout(
          supabase.from("dealer_profiles").select("user_id, dealership_name").in("user_id", userIds),
          "Dealers"
        );

        const imageByListing = new Map((primaryImages || []).map((img: any) => [img.listing_id, img.url]));
        const profileByUser = new Map((profiles || []).map((p: any) => [p.id, p]));
        const dealerByUser = new Map((dealers || []).map((d: any) => [d.user_id, d]));

        const listingsWithDetails: ListingWithDetails[] = data.map((listing: any) => {
          const dealer = dealerByUser.get(listing.user_id);
          const profile = profileByUser.get(listing.user_id);
          const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();

          return {
            ...listing,
            seller_name: dealer?.dealership_name || fullName || "Private Seller",
            seller_type: dealer ? "dealer" : "private",
            dealership_name: dealer?.dealership_name || null,
            primary_image_url: imageByListing.get(listing.id) || null,
          };
        });
        setListings(listingsWithDetails);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
      setListings([]);
    }
    setLoading(false);
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
          event: "Listing Approved",
          profile: { external_id: listing.user_id },
          properties: {
            vehicle_name: `${listing.year} ${listing.make} ${listing.model}`,
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

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ 
          status: "REJECTED",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      await loadListings();
    } catch (error) {
      console.error("Error rejecting listing:", error);
      alert("Failed to reject listing");
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
      setSelectedListings(prev => prev.filter(lid => lid !== id));
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const handleBulkApprove = async () => {
    if (!confirm(`Approve ${selectedListings.length} listings?`)) return;
    
    try {
      const { error } = await supabase
        .from("listings")
        .update({ 
          status: "ACTIVE",
          updated_at: new Date().toISOString()
        })
        .in("id", selectedListings);

      if (error) throw error;
      for (const listing of listings.filter((l) => selectedListings.includes(l.id))) {
        void trackClientEvent({
          event: "Listing Approved",
          profile: { external_id: listing.user_id },
          properties: {
            vehicle_name: `${listing.year} ${listing.make} ${listing.model}`,
            price: listing.price,
            image: listing.primary_image_url,
            url: `${window.location.origin}/listings/${listing.id}`,
            location: listing.location,
          },
        });
      }
      
      await loadListings();
      setSelectedListings([]);
    } catch (error) {
      console.error("Error bulk approving listings:", error);
      alert("Failed to approve listings");
    }
  };

  const handleBulkReject = async () => {
    if (!confirm(`Reject ${selectedListings.length} listings?`)) return;
    
    try {
      const { error } = await supabase
        .from("listings")
        .update({ 
          status: "REJECTED",
          updated_at: new Date().toISOString()
        })
        .in("id", selectedListings);

      if (error) throw error;
      
      await loadListings();
      setSelectedListings([]);
    } catch (error) {
      console.error("Error bulk rejecting listings:", error);
      alert("Failed to reject listings");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedListings.length} listings? This action cannot be undone.`)) return;
    
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .in("id", selectedListings);

      if (error) throw error;
      
      await loadListings();
      setSelectedListings([]);
    } catch (error) {
      console.error("Error bulk deleting listings:", error);
      alert("Failed to delete listings");
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${listing.year} ${listing.make} ${listing.model}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPackage = packageFilter === "all" || listing.package_tier.toLowerCase() === packageFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPackage;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Listings</h1>
          <p className="text-gray-500">Review, approve, and manage vehicle listings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listings/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#002D72] text-white font-medium rounded-xl hover:bg-[#001D4A] transition-colors"
          >
            <Car className="w-4 h-4" />
            <span className="text-sm">Create Listing</span>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats - Removed purple, using blue */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Listings", value: listings.length, color: "blue" },
          { label: "Pending Review", value: listings.filter(l => l.status === "PENDING").length, color: "yellow" },
          { label: "Active", value: listings.filter(l => l.status === "ACTIVE").length, color: "green" },
          { label: "Featured", value: listings.filter(l => l.is_featured).length, color: "blue" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className={`text-2xl font-black ${
              stat.color === "blue" ? "text-[#002D72]" :
              stat.color === "green" ? "text-green-600" :
              stat.color === "yellow" ? "text-yellow-600" :
              "text-[#E31837]"
            }`}>{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Packages</option>
            <option value="homepage_plus_ads">Homepage + Ads</option>
            <option value="homepage">Homepage</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        {selectedListings.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedListings.length} selected</span>
            <button 
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button 
              onClick={handleBulkReject}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Seller</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Package</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={() => toggleSelection(listing.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={listing.primary_image_url || "/images/logo.png"} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {listing.year} {listing.make} {listing.model}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <span className="font-mono">{listing.vin}</span>
                        <span>•</span>
                        <span>{listing.mileage.toLocaleString()} miles</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(listing.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{listing.seller_name}</span>
                    {listing.seller_type === "dealer" && (
                      <span className="px-1.5 py-0.5 bg-[#002D72] text-white text-[10px] font-bold rounded">
                        DEALER
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getPackageColor(listing.package_tier)}`}>
                    <Package className="w-3 h-3" />
                    {listing.package_tier.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(listing.price)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Detail - Fixed to use admin detail page */}
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {/* Edit Listing */}
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Listing"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    {listing.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(listing.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <Link
                      href={`/listings/${listing.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Live Page"
                    >
                      <Car className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredListings.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-500">
          Showing {filteredListings.length} of {listings.length} listings
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
