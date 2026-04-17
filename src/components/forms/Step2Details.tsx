"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { UploadCloud, Plus, Trash2, X, Loader2, Star } from "lucide-react";
import { useStorage } from "@/hooks/useStorage";

export default function Step2Details({ initialData, onNext, onBack }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: initialData });
  const [serviceRecords, setServiceRecords] = useState([
    { date: "", type: "", description: "", mileage: "" }
  ]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; storagePath: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [listingTag, setListingTag] = useState("");
  const [listingTagNumber, setListingTagNumber] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadListingImage } = useStorage();

  const addServiceRecord = () => {
    setServiceRecords([...serviceRecords, { date: "", type: "", description: "", mileage: "" }]);
  };

  const removeServiceRecord = (index: number) => {
    setServiceRecords(serviceRecords.filter((_, i) => i !== index));
  };

  const updateServiceRecord = (index: number, field: string, value: string) => {
    const updated = [...serviceRecords];
    updated[index][field as keyof typeof updated[0]] = value;
    setServiceRecords(updated);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Upload each file
    for (let i = 0; i < Math.min(files.length, 20 - uploadedImages.length); i++) {
      const file = files[i];
      
      // Create a temporary ID for the upload
      const tempId = `temp-${Date.now()}`;
      
      const result = await uploadListingImage(file, tempId);
      
      if (result) {
        setUploadedImages(prev => [...prev, result]);
      }
    }
    
    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setPrimary = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const onSubmit = (data: any) => {
    onNext({ ...data, serviceHistory: serviceRecords, images: uploadedImages });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Asking Price ($)</label>
          <input type="number" {...register("price", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-[var(--color-shelby-red)] text-sm" placeholder="105000" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Mileage</label>
          <input type="number" {...register("mileage", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-sm" placeholder="2500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Location</label>
        <input type="text" {...register("location", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-sm" placeholder="e.g. Las Vegas, NV" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Transmission *</label>
          <select {...register("transmission", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-sm">
            <option value="">Select transmission...</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Drivetrain *</label>
          <select {...register("drivetrain", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-sm">
            <option value="">Select drivetrain...</option>
            <option value="RWD">Rear-Wheel Drive (RWD)</option>
            <option value="AWD">All-Wheel Drive (AWD)</option>
            <option value="4WD">Four-Wheel Drive (4WD)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Vehicle Description</label>
        <textarea {...register("description", { required: true })} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none resize-none text-sm" placeholder="Describe your Shelby's condition, modifications, history..." />
      </div>

      {/* Vehicle History Section */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Vehicle History & Service Records</h3>
          <span className="text-xs text-gray-500">Buyers love detailed history</span>
        </div>
        
        <div className="space-y-3">
          {serviceRecords.map((record, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={record.date}
                    onChange={(e) => updateServiceRecord(index, "date", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Type</label>
                  <select 
                    value={record.type}
                    onChange={(e) => updateServiceRecord(index, "type", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs"
                  >
                    <option value="">Select...</option>
                    <option value="Service">Service</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Repair">Repair</option>
                    <option value="Modification">Modification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Mileage</label>
                  <input 
                    type="number" 
                    value={record.mileage}
                    onChange={(e) => updateServiceRecord(index, "mileage", e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Description</label>
                    <input 
                      type="text" 
                      value={record.description}
                      onChange={(e) => updateServiceRecord(index, "description", e.target.value)}
                      placeholder="e.g. Oil change, tire rotation"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  {serviceRecords.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeServiceRecord(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          type="button"
          onClick={addServiceRecord}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-shelby-blue)] border border-[var(--color-shelby-blue)] rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Another Service Record
        </button>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
          Photos ({uploadedImages.length}/20)
        </label>
        
        {/* Upload Area */}
        {uploadedImages.length < 20 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 mb-3 text-[var(--color-shelby-blue)] animate-spin" />
                  <p className="font-bold text-gray-800 text-sm mb-1">Uploading...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 mb-3 text-[var(--color-shelby-blue)] opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110" />
                  <p className="font-bold text-gray-800 text-sm mb-1 text-center break-words">Click to upload or drag & drop</p>
                  <p className="text-xs font-medium text-gray-500 text-center">High-res JPEG, PNG (max 10MB each)</p>
                </>
              )}
            </div>
          </>
        )}

        {/* Preview Grid */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group cursor-pointer" onClick={() => setPrimary(index)}>
                <img 
                  src={image.url} 
                  alt={`Upload ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 flex gap-1">
                  {index === primaryImageIndex && (
                    <div className="px-2 py-0.5 bg-[var(--color-shelby-blue)] text-white text-[10px] font-bold rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Primary
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Tag */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
          Listing Tag (Optional)
        </label>
        <select value={listingTag} onChange={(e) => setListingTag(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-sm">
          <option value="">None</option>
          <option value="Just Listed">Just Listed</option>
          <option value="Rare Spec">Rare Spec</option>
          <option value="1 of #__">1 of #__</option>
        </select>
        {listingTag === '1 of #__' && (
          <div className="mt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Total Produced</label>
            <input type="number" value={listingTagNumber} onChange={(e) => setListingTagNumber(e.target.value)} placeholder="e.g. 500" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-sm" />
          </div>
        )}
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl flex items-start gap-3 border border-gray-200 hover:border-[var(--color-shelby-blue)] hover:bg-blue-50/20 transition-colors">
        <input type="checkbox" {...register("legal_confirm", { required: true })} className="mt-0.5 w-5 h-5 accent-[var(--color-shelby-blue)] cursor-pointer shrink-0" />
        <label className="text-sm text-gray-800 font-medium leading-relaxed">
          I confirm the listing price includes all fees and I hold the legal title to this vehicle.
        </label>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button type="button" onClick={onBack} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-sm">
          &larr; Back
        </button>
        <button type="submit" className="px-8 py-3 bg-[var(--color-shelby-blue)] text-white font-bold rounded-lg hover:bg-[#001D40] transition-colors shadow-lg shadow-blue-900/20 active:scale-95 text-sm">
          Choose Package &rarr;
        </button>
      </div>
    </form>
  );
}
