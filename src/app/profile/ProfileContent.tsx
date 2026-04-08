"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Phone, MapPin, Mail, Camera, Heart, 
  Car, Settings, LogOut, Loader2, Pencil, 
  ChevronRight, Plus, Trash2, ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { useFavorites, useProfile } from "@/hooks/useFavorites";
import { useStorage } from "@/hooks/useStorage";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
        active 
          ? "bg-[#002D72] text-white border-b-2 border-[#E31837]" 
          : "text-[#565d6d] hover:text-[#002D72] hover:bg-[#002D72]/5"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
          active ? "bg-white/20" : "bg-[#f3f4f6]"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function ListingCard({ listing, onDelete }: { listing: any; onDelete?: () => void }) {
  const primaryImage = listing.images?.find((img: any) => img.is_primary) || listing.images?.[0];
  
  return (
    <div className="bg-white rounded-xl border border-[#dee1e6] overflow-hidden card-shadow group">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={primaryImage?.url || "https://placehold.co/600x400/1e293b/ffffff?text=No+Image"} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.status === 'PENDING' && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full uppercase">
              Pending
            </span>
          )}
          {listing.is_featured && (
            <span className="px-3 py-1 bg-[#E31837] text-white text-[10px] font-bold rounded-full uppercase">
              Featured
            </span>
          )}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-outfit font-bold text-lg mb-1 line-clamp-1">
          {listing.year} {listing.make} {listing.model}
        </h3>
        <p className="text-sm text-[#565d6d] mb-3">{listing.trim || ''}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-[#E31837]">
            ${listing.price.toLocaleString()}
          </span>
          <Link 
            href={`/listings/${listing.id}`}
            className="flex items-center gap-1 text-sm font-bold text-[#002D72] hover:underline"
          >
            View <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'favorites'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    user_location: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { listings: myListings, isLoading: listingsLoading } = useListings({ userId: user?.id });
  const { favorites, isLoading: favoritesLoading, removeFavorite } = useFavorites();
  const { updateProfile, isUpdating } = useProfile();
  const { uploadListingImage } = useStorage();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push('/login?redirect=/profile');
    return null;
  }

  const handleEdit = () => {
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      user_location: profile?.location || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const { error } = await updateProfile({
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      phone: editForm.phone,
      location: editForm.user_location,
    });
    if (!error) {
      await refreshProfile();
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    
    // Upload to avatar-images bucket
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatar-images')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      setIsUploadingAvatar(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatar-images')
      .getPublicUrl(filePath);
    
    await updateProfile({ avatar_url: publicUrl });
    await refreshProfile();
    setIsUploadingAvatar(false);
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-[#fafafb]">
      {/* Header Banner */}
      <div className="bg-[#002D72] py-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#002D72] flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                    {getInitials()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#E31837] text-white rounded-full shadow-lg hover:bg-[#c41530] transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-outfit font-black tracking-tight mb-2">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'My Profile'
                }
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/70">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {profile?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                  {profile?.role || 'BUYER'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-white text-[#002D72] font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={signOut}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#dee1e6] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="flex">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<User className="w-4 h-4" />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'listings'}
              onClick={() => setActiveTab('listings')}
              icon={<Car className="w-4 h-4" />}
              label="My Listings"
              count={myListings.length}
            />
            <TabButton
              active={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
              icon={<Heart className="w-4 h-4" />}
              label="Favorites"
              count={favorites.length}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#dee1e6] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-outfit font-bold">Contact Information</h2>
                  <button
                    onClick={handleEdit}
                    className="p-2 text-[#565d6d] hover:text-[#002D72] hover:bg-[#002D72]/5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#565d6d]">Full Name</label>
                    <p className="font-medium">
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#565d6d]">Email</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#565d6d]">Phone</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#565d6d]" />
                      {profile?.phone || 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#565d6d]">Location</label>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#565d6d]" />
                      {profile?.location || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Listings */}
              {myListings.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#dee1e6] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-outfit font-bold">Recent Listings</h2>
                    <Link 
                      href="/sell"
                      className="flex items-center gap-1 text-sm font-bold text-[#002D72] hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Add New
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myListings.slice(0, 2).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  {myListings.length > 2 && (
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="mt-6 w-full py-3 border border-[#dee1e6] rounded-lg text-sm font-bold text-[#565d6d] hover:border-[#002D72] hover:text-[#002D72] transition-colors"
                    >
                      View All {myListings.length} Listings
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl border border-[#dee1e6] p-8">
                <h2 className="text-xl font-outfit font-bold mb-6">Account Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#fafafb] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#002D72]/10 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-[#002D72]" />
                      </div>
                      <span className="font-medium">My Listings</span>
                    </div>
                    <span className="text-2xl font-black text-[#002D72]">{myListings.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#fafafb] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E31837]/10 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#E31837]" />
                      </div>
                      <span className="font-medium">Favorites</span>
                    </div>
                    <span className="text-2xl font-black text-[#E31837]">{favorites.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-[#dee1e6] p-8">
                <h2 className="text-xl font-outfit font-bold mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/sell"
                    className="flex items-center gap-3 p-4 bg-[#002D72] text-white rounded-xl hover:bg-[#001D4A] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Sell Your Shelby</span>
                  </Link>
                  <Link
                    href="/listings"
                    className="flex items-center gap-3 p-4 border border-[#dee1e6] rounded-xl hover:border-[#002D72] hover:text-[#002D72] transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-bold">Browse Inventory</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-outfit font-bold">My Listings</h2>
              <Link
                href="/sell"
                className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
            </div>
            
            {listingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#dee1e6]">
                <Car className="w-16 h-16 mx-auto mb-4 text-[#dee1e6]" />
                <h3 className="text-xl font-bold mb-2">No listings yet</h3>
                <p className="text-[#565d6d] mb-6">Start selling your Shelby today</p>
                <Link
                  href="/sell"
                  className="inline-flex px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-2xl font-outfit font-bold mb-8">My Favorites</h2>
            
            {favoritesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#dee1e6]">
                <Heart className="w-16 h-16 mx-auto mb-4 text-[#dee1e6]" />
                <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                <p className="text-[#565d6d] mb-6">Save your dream Shelbys here</p>
                <Link
                  href="/listings"
                  className="inline-flex px-8 py-3 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
                >
                  Browse Inventory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((listing) => (
                  <div key={listing.id} className="relative">
                    <ListingCard listing={listing} />
                    <button
                      onClick={() => removeFavorite(listing.id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full text-[#E31837] hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-outfit font-bold mb-6">Edit Profile</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171a1f] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.user_location}
                  onChange={(e) => setEditForm({ ...editForm, user_location: e.target.value })}
                  placeholder="City, State"
                  className="w-full h-12 px-4 bg-[#f3f4f6]/50 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72] focus:ring-2 focus:ring-[#002D72]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 border border-[#dee1e6] text-[#565d6d] font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1 py-3 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
