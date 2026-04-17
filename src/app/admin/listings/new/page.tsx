"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, 
  Car, 
  DollarSign, 
  MapPin, 
  UploadCloud, 
  X, 
  Loader2,
  Save,
  Plus,
  Wrench,
  Star
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { trackClientEvent } from "@/lib/klaviyo/client";

const TRANSMISSIONS = ["Manual", "Automatic"];
const DRIVETRAINS = ["RWD", "AWD", "4WD"];
const PACKAGES = [
  { id: "STANDARD", name: "Standard Listing", price: 0 },
  { id: "HOMEPAGE", name: "Homepage Featured", price: 0 },
  { id: "HOMEPAGE_PLUS_ADS", name: "Homepage + Google Ads", price: 0 },
];

type ServiceRecord = { date: string; type: string; description: string; mileage: string };

export default function AdminCreateListing() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; storagePath: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([
    { date: "", type: "", description: "", mileage: "" }
  ]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  const [formData, setFormData] = useState({
    vin: "",
    year: new Date().getFullYear(),
    make: "Ford",
    model: "",
    trim: "",
    price: "",
    mileage: "",
    transmission: "Manual",
    drivetrain: "RWD",
    exterior_color: "",
    interior_color: "",
    location: "",
    description: "",
    package_tier: "STANDARD",
    status: "ACTIVE", // Admin can set status directly
    is_featured: false,
    engine: "",
    listing_tags: [] as { type: string; number?: number }[],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    
    for (let i = 0; i < Math.min(files.length, 20 - uploadedImages.length); i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("pathname", `admin-listings/${Date.now()}-${file.name}`);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) continue;

        const data = await response.json();
        setUploadedImages(prev => [...prev, { url: data.url, storagePath: data.pathname }]);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const addServiceRecord = () => {
    setServiceRecords([...serviceRecords, { date: "", type: "", description: "", mileage: "" }]);
  };

  const removeServiceRecord = (index: number) => {
    setServiceRecords(serviceRecords.filter((_, i) => i !== index));
  };

  const updateServiceRecord = (index: number, field: keyof ServiceRecord, value: string) => {
    const updated = [...serviceRecords];
    updated[index][field] = value;
    setServiceRecords(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        alert("You must be logged in");
        return;
      }

      const insertData = {
        user_id: user.id,
        vin: formData.vin,
        year: Number(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || "",
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        exterior_color: formData.exterior_color || "",
        interior_color: formData.interior_color || "",
        location: formData.location,
        description: formData.description,
        package_tier: formData.package_tier,
        status: "ACTIVE",
        is_featured: formData.is_featured || false,
        engine: formData.engine || "",
        listing_tags: formData.listing_tags.length > 0 ? JSON.stringify(formData.listing_tags) : null,
        service_history: JSON.stringify(serviceRecords.filter(r => r.date || r.type || r.description)),
      };
      
      console.log('Inserting listing:', insertData);
      
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { listing, listingError });

      if (listingError) {
        console.error('Listing error:', listingError);
        alert("Error: " + listingError.message);
        setLoading(false);
        return;
      }

      if (!listing) {
        alert("Failed to create listing");
        setLoading(false);
        return;
      }

      console.log('Listing created:', listing);

      // Add images
      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((img, index) => ({
          listing_id: listing.id,
          url: img.url,
          storage_path: img.storagePath,
          is_primary: index === primaryImageIndex,
          order_index: index,
        }));

        const { error: imageError } = await supabase
          .from('listing_images')
          .insert(imageRecords);

        console.log('Image insert result:', { imageError });
        
        if (imageError) {
          console.error('Image error:', imageError);
        }
      }

      void trackClientEvent({
        event: "New listing created",
        profile: {
          external_id: user.id,
          email: user.email,
        },
        properties: {
          listing_id: listing.id,
          vehicle_name: `${formData.year} ${formData.make} ${formData.model}`,
          year: Number(formData.year),
          make: formData.make,
          model: formData.model,
          trim: formData.trim || null,
          price: Number(formData.price),
          image: uploadedImages[0]?.url || null,
          url: `${window.location.origin}/listings/${listing.id}`,
          location: formData.location,
          listing_status: "ACTIVE",
          created_by: "admin",
        },
      });

      alert('Listing created successfully!');
      router.push('/admin/listings');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/listings" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-outfit font-black text-gray-900">Create Listing</h1>
          <p className="text-gray-500">Add a new vehicle listing (Admin - No payment required)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-[#002D72]" />
            Vehicle Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VIN *</label>
              <input
                type="text"
                required
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="1FA6P8CF1L5100001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="GT500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trim</label>
              <input
                type="text"
                value={formData.trim}
                onChange={(e) => handleInputChange('trim', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="Heritage Edition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
              <input
                type="text"
                value={formData.engine}
                onChange={(e) => handleInputChange('engine', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="5.2L Supercharged V8"
              />
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#002D72]" />
            Specifications & Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                  placeholder="105000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage *</label>
              <input
                type="number"
                required
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
              <select
                required
                value={formData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              >
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drivetrain *</label>
              <select
                required
                value={formData.drivetrain}
                onChange={(e) => handleInputChange('drivetrain', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              >
                {DRIVETRAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exterior Color</label>
              <input
                type="text"
                value={formData.exterior_color}
                onChange={(e) => handleInputChange('exterior_color', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="Shadow Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interior Color</label>
              <input
                type="text"
                value={formData.interior_color}
                onChange={(e) => handleInputChange('interior_color', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                placeholder="Recaro Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                  placeholder="Las Vegas, NV"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none resize-none"
              placeholder="Describe the vehicle condition, history, modifications..."
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#002D72]" />
            Images ({uploadedImages.length}/20)
          </h2>

          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading || uploadedImages.length >= 20}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#002D72] transition-colors ${
                isUploading ? 'opacity-50' : ''
              }`}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[#002D72] animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload images</span>
                </>
              )}
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => setPrimaryImageIndex(index)}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {index === primaryImageIndex && (
                    <span className="absolute top-1 left-1 px-2 py-0.5 bg-[#002D72] text-white text-[10px] font-bold rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryImageIndex(index);
                    }}
                    className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${index === primaryImageIndex ? 'bg-yellow-400 text-[#002D72]' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70'}`}
                  >
                    <Star className="w-3 h-3" fill={index === primaryImageIndex ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute bottom-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#002D72]" />
            Service History
          </h2>

          <div className="space-y-4">
            {serviceRecords.map((record, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input type="date" value={record.date} onChange={(e) => updateServiceRecord(index, "date", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Service Type</label>
                    <input type="text" value={record.type} onChange={(e) => updateServiceRecord(index, "type", e.target.value)} placeholder="Oil change, brake service..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mileage</label>
                    <input type="number" value={record.mileage} onChange={(e) => updateServiceRecord(index, "mileage", e.target.value)} placeholder="25000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" />
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="text" value={record.description} onChange={(e) => updateServiceRecord(index, "description", e.target.value)} placeholder="Notes..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none" />
                    {serviceRecords.length > 1 && (
                      <button type="button" onClick={() => removeServiceRecord(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addServiceRecord} className="flex items-center gap-2 text-sm font-medium text-[#002D72] hover:text-[#001D4A]"><Plus className="w-4 h-4" /> Add Service Record</button>
          </div>
        </div>

        {/* Admin Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6">Admin Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Tier</label>
              <select
                value={formData.package_tier}
                onChange={(e) => handleInputChange('package_tier', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              >
                {PACKAGES.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              >
                <option value="ACTIVE">Active (Live)</option>
                <option value="PENDING">Pending (Review)</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-[#002D72] rounded focus:ring-[#002D72]"
                />
                <span className="text-sm font-medium text-gray-700">Featured Listing</span>
              </label>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.listing_tags.map((tag: any, idx: number) => (
                  <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${tag.type === 'Just Listed' ? 'bg-[#002D72] text-white' : tag.type === 'Rare Spec' ? 'bg-purple-600 text-white' : 'bg-[#E31837] text-white'}`}>
                    {tag.type === '1 of #__' && tag.number ? `1 of ${tag.number}` : tag.type}
                    <button type="button" onClick={() => handleInputChange('listing_tags', formData.listing_tags.filter((_: any, i: number) => i !== idx))} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  id="new-tag-type"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm"
                >
                  <option value="">Select tag...</option>
                  <option value="Just Listed">Just Listed</option>
                  <option value="Rare Spec">Rare Spec</option>
                  <option value="1 of #__">1 of #__</option>
                </select>
                <input
                  id="new-tag-number"
                  type="number"
                  placeholder="#"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const typeEl = document.getElementById('new-tag-type') as HTMLSelectElement;
                    const numEl = document.getElementById('new-tag-number') as HTMLInputElement;
                    if (!typeEl || !typeEl.value) return;
                    const newTag: { type: string; number?: number } = { type: typeEl.value };
                    if (typeEl.value === '1 of #__' && numEl.value) {
                      newTag.number = parseInt(numEl.value);
                    }
                    handleInputChange('listing_tags', [...formData.listing_tags, newTag]);
                    typeEl.value = '';
                    numEl.value = '';
                  }}
                  className="px-4 py-2 bg-[#002D72] text-white text-sm font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/listings"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#002D72] text-white font-medium rounded-lg hover:bg-[#001D4A] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
