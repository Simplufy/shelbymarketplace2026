'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, CheckCircle, XCircle, Calendar, MapPin, User, 
  Car, FileText, Image as ImageIcon,
  Loader2, Package, Phone, Mail, Check, Wrench, Tag, Edit2, Save, X
} from 'lucide-react';

interface ListingDetail {
  id: string;
  vin: string;
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
  status: string;
  package_tier: string;
  is_featured: boolean;
  title_status: string | null;
  previous_owners: number | null;
  accidents: string | null;
  listing_tags: any;
  service_history: any;
  created_at: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string | null;
  seller_type: 'private' | 'dealer';
  dealership_name: string | null;
  images: { url: string; is_primary: boolean }[];
  features: string[];
}

export default function AdminListingDetail() {
  const params = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const [tagForm, setTagForm] = useState({ type: "", number: "" });
  const [savingTag, setSavingTag] = useState(false);
  const supabase = createClient();
  const listingId = params.id as string;

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    setLoading(true);
    try {
      // Get listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Get images
      const { data: imagesData, error: imagesError } = await supabase
        .from('listing_images')
        .select('url, is_primary')
        .eq('listing_id', listingId)
        .order('order_index', { ascending: true });

      if (imagesError) throw imagesError;

      // Get features
      const { data: featuresData, error: featuresError } = await supabase
        .from('listing_features')
        .select('feature')
        .eq('listing_id', listingId);

      if (featuresError) throw featuresError;

      // Get seller info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, location, role')
        .eq('id', listingData.user_id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Get dealer info if applicable
      let dealershipName = null;
      if (profileData?.role === 'DEALER') {
        const { data: dealerData } = await supabase
          .from('dealer_profiles')
          .select('dealership_name')
          .eq('user_id', listingData.user_id)
          .single();
        dealershipName = dealerData?.dealership_name;
      }

      setListing({
        ...listingData,
        seller_name: profileData 
          ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        seller_email: profileData?.email || 'N/A',
        seller_phone: profileData?.phone,
        seller_type: profileData?.role === 'DEALER' ? 'dealer' : 'private',
        dealership_name: dealershipName,
        images: imagesData || [],
        features: featuresData?.map(f => f.feature) || []
      });
      setTagForm({ type: "", number: "" });
    } catch (error) {
      console.error('Error loading listing:', error);
      alert('Failed to load listing details');
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!listing) return;
    setApproving(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;
      
      // Reload to show updated status
      await loadListing();
      alert('Listing approved successfully! It is now live on the website.');
    } catch (error) {
      console.error('Error approving listing:', error);
      alert('Failed to approve listing');
    }
    setApproving(false);
  };

  const handleReject = async () => {
    if (!listing) return;
    if (!confirm('Are you sure you want to reject this listing?')) return;
    
    setRejecting(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'REJECTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;
      
      await loadListing();
      alert('Listing rejected.');
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert('Failed to reject listing');
    }
    setRejecting(false);
  };

  const handleSaveTag = async () => {
    if (!listing) return;
    if (!tagForm.type) return;
    setSavingTag(true);
    try {
      const currentTags = listing.listing_tags ? (typeof listing.listing_tags === 'string' ? JSON.parse(listing.listing_tags) : listing.listing_tags) : [];
      const newTag: { type: string; number?: number } = { type: tagForm.type };
      if (tagForm.type === '1 of #__' && tagForm.number) {
        newTag.number = parseInt(tagForm.number);
      }
      const updatedTags = [...currentTags, newTag];
      const { error } = await supabase
        .from('listings')
        .update({
          listing_tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);
      if (error) throw error;
      await loadListing();
      setTagForm({ type: "", number: "" });
    } catch (error) {
      console.error('Error saving tag:', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes("'listing_tags'")) {
        alert("This project's database is missing the listing_tags column. Please run the latest migrations.");
      } else {
        alert('Failed to save listing tag');
      }
    }
    setSavingTag(false);
  };

  const handleRemoveTag = async (idx: number) => {
    if (!listing) return;
    const currentTags = listing.listing_tags ? (typeof listing.listing_tags === 'string' ? JSON.parse(listing.listing_tags) : listing.listing_tags) : [];
    const updatedTags = currentTags.filter((_: any, i: number) => i !== idx);
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          listing_tags: updatedTags.length > 0 ? updatedTags : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);
      if (error) throw error;
      await loadListing();
    } catch (error) {
      console.error('Error removing tag:', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes("'listing_tags'")) {
        alert("This project's database is missing the listing_tags column. Please run the latest migrations.");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'sold': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case 'homepage_plus_ads': return 'bg-[#002D72] text-white';
      case 'homepage': return 'bg-[#002D72] text-white';
      case 'standard': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-500 mb-4">The listing you\'re looking for doesn\'t exist.</p>
          <Link 
            href="/admin/listings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#002D72] text-white rounded-lg hover:bg-[#001D4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/listings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-outfit font-black text-gray-900">
              {listing.year} {listing.make} {listing.model}
            </h1>
            <p className="text-gray-500">VIN: {listing.vin}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span className={`px-4 py-2 rounded-lg font-bold text-sm border ${getStatusColor(listing.status)}`}>
            {listing.status}
          </span>

          {/* Package Badge */}
          <span className={`px-4 py-2 rounded-lg font-bold text-sm ${getPackageColor(listing.package_tier)}`}>
            {listing.package_tier.replace(/_/g, ' ')}
          </span>

          {/* Action Buttons */}
          {listing.status === 'PENDING' && (
            <>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {approving ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}

          <Link
            href={`/listings/${listing.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
          >
            <Car className="w-4 h-4" />
            View Live
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Photos ({listing.images.length})
            </h2>
            {listing.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {listing.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 ${
                      img.is_primary ? 'border-[#002D72]' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={img.url} 
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-[#002D72] text-white text-xs font-bold rounded">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No images uploaded</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Features & Options</h2>
            {listing.features.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No features listed</p>
            )}
          </div>
        </div>

        {/* Right Column - Vehicle & Seller Info */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-[#002D72] rounded-xl p-6 text-white">
            <p className="text-white/70 text-sm mb-1">Asking Price</p>
            <p className="text-3xl font-black">{formatPrice(listing.price)}</p>
            {listing.mileage > 0 && (
              <p className="text-white/70 text-sm mt-2">
                {listing.mileage.toLocaleString()} miles
              </p>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Year</span>
                <span className="font-medium">{listing.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Make</span>
                <span className="font-medium">{listing.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span className="font-medium">{listing.model}</span>
              </div>
              {listing.trim && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Trim</span>
                  <span className="font-medium">{listing.trim}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Transmission</span>
                <span className="font-medium">{listing.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Drivetrain</span>
                <span className="font-medium">{listing.drivetrain}</span>
              </div>
              {listing.engine && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Engine</span>
                  <span className="font-medium">{listing.engine}</span>
                </div>
              )}
              {listing.exterior_color && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Exterior Color</span>
                  <span className="font-medium">{listing.exterior_color}</span>
                </div>
              )}
              {listing.interior_color && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Interior Color</span>
                  <span className="font-medium">{listing.interior_color}</span>
                </div>
              )}
              {listing.title_status && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Title Status</span>
                  <span className="font-medium">{listing.title_status}</span>
                </div>
              )}
              {listing.previous_owners !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Previous Owners</span>
                  <span className="font-medium">{listing.previous_owners}</span>
                </div>
              )}
              {listing.accidents && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Accident History</span>
                  <span className="font-medium">{listing.accidents}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{listing.seller_name}</p>
                  {listing.seller_type === 'dealer' && (
                    <span className="inline-block px-2 py-0.5 bg-[#002D72] text-white text-xs font-bold rounded mt-1">
                      DEALER
                    </span>
                  )}
                </div>
              </div>
              {listing.dealership_name && (
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-400" />
                  <p className="font-medium">{listing.dealership_name}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${listing.seller_email}`} className="text-[#002D72] hover:underline">
                  {listing.seller_email}
                </a>
              </div>
              {listing.seller_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${listing.seller_phone}`} className="text-[#002D72] hover:underline">
                    {listing.seller_phone}
                  </a>
                </div>
              )}
              {listing.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-700">{listing.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Submission Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Submitted:</span>
                <span>{formatDate(listing.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Package:</span>
                <span className="font-medium">{listing.package_tier.replace(/_/g, ' ')}</span>
              </div>
              {listing.is_featured && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Featured Listing</span>
                </div>
              )}
            </div>
          </div>

          {/* Listing Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Listing Tags
            </h2>
            <div className="space-y-3">
              {listing.listing_tags && Array.isArray(listing.listing_tags) && listing.listing_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.listing_tags.map((tag: any, idx: number) => (
                    <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${tag.type === 'Just Listed' ? 'bg-[#002D72] text-white' : tag.type === 'Rare Spec' ? 'bg-purple-600 text-white' : 'bg-[#E31837] text-white'}`}>
                      {tag.type === '1 of #__' && tag.number ? `1 of ${tag.number}` : tag.type}
                      <button onClick={() => handleRemoveTag(idx)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <select value={tagForm.type} onChange={(e) => setTagForm({ ...tagForm, type: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none">
                  <option value="">Select tag...</option>
                  <option value="Just Listed">Just Listed</option>
                  <option value="Rare Spec">Rare Spec</option>
                  <option value="1 of #__">1 of #__</option>
                </select>
                {tagForm.type === '1 of #__' && (
                  <input type="number" value={tagForm.number} onChange={(e) => setTagForm({ ...tagForm, number: e.target.value })} placeholder="#" className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" />
                )}
                <button onClick={handleSaveTag} disabled={savingTag || !tagForm.type} className="px-4 py-2 bg-[#002D72] text-white text-sm font-bold rounded-lg hover:bg-[#001D4A] transition-colors disabled:opacity-50 flex items-center gap-1">
                  {savingTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Add
                </button>
              </div>
            </div>
          </div>

          {/* Service History */}
          {listing.service_history && Array.isArray(listing.service_history) && listing.service_history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Service History
              </h2>
              <div className="space-y-3">
                {listing.service_history.map((record: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#002D72]">{record.date || 'N/A'}</span>
                      {record.type && <span className="px-2 py-0.5 bg-[#002D72]/10 text-[#002D72] text-[10px] font-bold rounded-full">{record.type}</span>}
                      {record.mileage && <span className="text-xs text-gray-500">{Number(record.mileage).toLocaleString()} mi</span>}
                    </div>
                    {record.description && <p className="text-xs text-gray-600">{record.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
