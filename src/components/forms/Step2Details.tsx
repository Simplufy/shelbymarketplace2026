"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, UploadCloud, Plus, Trash2, X, Loader2, Star } from "lucide-react";
import { useStorage } from "@/hooks/useStorage";

const MAX_PARALLEL_UPLOADS = 3;

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
};

export default function Step2Details({ initialData, onNext, onBack }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: initialData });
  const [serviceRecords, setServiceRecords] = useState([
    { date: "", type: "", description: "", mileage: "" }
  ]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; storagePath: string }[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(initialData?.primaryImageIndex || 0);
  const [listingTags, setListingTags] = useState<{ type: string; number?: number }[]>(initialData?.listingTags || []);
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

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const remainingSlots = 20 - uploadedImages.length;
    const selectedFiles = files.slice(0, remainingSlots);
    const failedUploads: string[] = [];

    if (files.length > remainingSlots) {
      failedUploads.push(`Only ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} can be added.`);
    }

    const uploadQueue = [...selectedFiles];
    const uploadNext = async () => {
      const file = uploadQueue.shift();
      if (!file) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const uploadId = `${tempId}-${file.name}`;
      setUploadItems((prev) => [
        ...prev,
        { id: uploadId, name: file.name, progress: 0, status: "uploading" },
      ]);

      const result = await uploadListingImage(file, tempId, {
        onProgress: (percentage) => {
          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? {
                    ...item,
                    progress: Math.max(item.progress, Math.round(percentage)),
                    status: percentage >= 100 ? "processing" : "uploading",
                  }
                : item
            )
          );
        },
      });

      if (result.ok) {
        setUploadedImages((prev) => [...prev, result]);
        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: 100, status: "complete" } : item
          )
        );
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
        }, 1800);
      } else {
        failedUploads.push(`${file.name}: ${result.error}`);
        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: "error", error: result.error }
              : item
          )
        );
      }

      if (uploadQueue.length > 0) {
        await uploadNext();
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(MAX_PARALLEL_UPLOADS, selectedFiles.length) },
        () => uploadNext()
      )
    );
    
    setIsUploading(false);
    if (failedUploads.length > 0) {
      setUploadError(failedUploads.slice(0, 3).join(" "));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadFiles(Array.from(e.target.files || []));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await uploadFiles(Array.from(e.dataTransfer.files || []));
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= uploadedImages.length || fromIndex === toIndex) return;

    setUploadedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setPrimaryImageIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  };

  const onSubmit = (data: any) => {
    onNext({ ...data, serviceHistory: serviceRecords, images: uploadedImages, primaryImageIndex, listingTags });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Asking Price ($)</label>
          <input type="number" {...register("price", { required: true })} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-[var(--color-shelby-red)] text-xs md:text-sm" placeholder="105000" />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Mileage</label>
          <input type="number" {...register("mileage", { required: true })} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-xs md:text-sm" placeholder="2500" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Location</label>
        <input type="text" {...register("location", { required: true })} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-xs md:text-sm" placeholder="e.g. Las Vegas, NV" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Transmission *</label>
          <select {...register("transmission", { required: true })} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-xs md:text-sm">
            <option value="">Select transmission...</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Drivetrain *</label>
          <select {...register("drivetrain", { required: true })} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-xs md:text-sm">
            <option value="">Select drivetrain...</option>
            <option value="RWD">Rear-Wheel Drive (RWD)</option>
            <option value="AWD">All-Wheel Drive (AWD)</option>
            <option value="4WD">Four-Wheel Drive (4WD)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">Vehicle Description</label>
        <textarea {...register("description", { required: true })} rows={3} className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none resize-none text-xs md:text-sm" placeholder="Describe your Shelby's condition, modifications, history..." />
      </div>

      {/* Vehicle History Section */}
      <div className="pt-3 md:pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide">Vehicle History & Service Records</h3>
          <span className="text-[10px] md:text-xs text-gray-500">Buyers love detailed history</span>
        </div>
        
        <div className="space-y-2 md:space-y-3">
          {serviceRecords.map((record, index) => (
            <div key={index} className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={record.date}
                    onChange={(e) => updateServiceRecord(index, "date", e.target.value)}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white border border-gray-200 rounded text-[10px] md:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase mb-1">Type</label>
                  <select 
                    value={record.type}
                    onChange={(e) => updateServiceRecord(index, "type", e.target.value)}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white border border-gray-200 rounded text-[10px] md:text-xs"
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
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase mb-1">Mileage</label>
                  <input 
                    type="number" 
                    value={record.mileage}
                    onChange={(e) => updateServiceRecord(index, "mileage", e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white border border-gray-200 rounded text-[10px] md:text-xs"
                  />
                </div>
                <div className="flex items-end gap-1 md:gap-2">
                  <div className="flex-1">
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-600 uppercase mb-1">Description</label>
                    <input 
                      type="text" 
                      value={record.description}
                      onChange={(e) => updateServiceRecord(index, "description", e.target.value)}
                      placeholder="e.g. Oil change"
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white border border-gray-200 rounded text-[10px] md:text-xs"
                    />
                  </div>
                  {serviceRecords.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeServiceRecord(index)}
                      className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
          className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-[var(--color-shelby-blue)] border border-[var(--color-shelby-blue)] rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4" /> Add Record
        </button>
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">
          Photos ({uploadedImages.length}/20)
        </label>
        
        {/* Upload Area */}
        {uploadedImages.length < 20 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 text-[var(--color-shelby-blue)] animate-spin" />
                  <p className="font-bold text-gray-800 text-xs md:text-sm mb-1">Uploading...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 text-[var(--color-shelby-blue)] opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110" />
                  <p className="font-bold text-gray-800 text-xs md:text-sm mb-1 text-center break-words">Click to upload or drag & drop</p>
                  <p className="text-[10px] md:text-xs font-medium text-gray-500 text-center">High-res JPEG, PNG, WebP, GIF, HEIC, or HEIF (max 10MB each)</p>
                </>
              )}
            </div>
            {uploadError && (
              <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>
            )}
            {uploadItems.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-xs font-semibold text-gray-800">{item.name}</span>
                      <span className={`shrink-0 text-[10px] font-bold uppercase ${
                        item.status === "error" ? "text-red-600" :
                        item.status === "complete" ? "text-green-700" :
                        "text-[#002D72]"
                      }`}>
                        {item.status === "processing" ? "Processing" : item.status === "complete" ? "Uploaded" : item.status === "error" ? "Failed" : `${item.progress}%`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === "error" ? "bg-red-500" :
                          item.status === "complete" ? "bg-green-600" :
                          "bg-[#002D72]"
                        }`}
                        style={{ width: `${Math.max(item.progress, item.status === "processing" ? 96 : 0)}%` }}
                      />
                    </div>
                    {item.error ? <p className="mt-1 text-[10px] text-red-600">{item.error}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Preview Grid */}
        {uploadedImages.length > 0 && (
          <div className="mt-3 md:mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group cursor-pointer" onClick={() => setPrimary(index)}>
                <Image
                  src={image.url} 
                  alt={`Upload ${index + 1}`} 
                  fill
                  sizes="(min-width: 768px) 20vw, 33vw"
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-1 left-1 flex gap-1">
                  {index === primaryImageIndex && (
                    <div className="px-1.5 md:px-2 py-0.5 bg-[var(--color-shelby-blue)] text-white text-[8px] md:text-[10px] font-bold rounded flex items-center gap-0.5 md:gap-1">
                      <Star className="w-2 h-2 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" /> Primary
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1); }}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#002D72] shadow disabled:opacity-35 disabled:cursor-not-allowed"
                    aria-label={`Move photo ${index + 1} earlier`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPrimary(index); }}
                    className="min-w-0 flex-1 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold uppercase text-white"
                    aria-label={`Set photo ${index + 1} as primary`}
                  >
                    {index === primaryImageIndex ? "Primary" : "Make Primary"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1); }}
                    disabled={index === uploadedImages.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#002D72] shadow disabled:opacity-35 disabled:cursor-not-allowed"
                    aria-label={`Move photo ${index + 1} later`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Tags */}
      <div>
        <label className="block text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 md:mb-1.5">
          Listing Tags (Optional)
        </label>
        {listingTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2">
            {listingTags.map((tag, idx) => (
              <span key={idx} className={`inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-full ${tag.type === 'Just Listed' ? 'bg-[#002D72] text-white' : tag.type === 'Rare Spec' ? 'bg-purple-600 text-white' : 'bg-[#E31837] text-white'}`}>
                {tag.type === '1 of #__' && tag.number ? `1 of ${tag.number}` : tag.type}
                <button type="button" onClick={() => setListingTags(listingTags.filter((_, i) => i !== idx))} className="ml-0.5 md:ml-1 hover:opacity-70"><X className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 md:gap-2">
          <select id="user-tag-type" className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-xs md:text-sm">
            <option value="">Select tag...</option>
            <option value="Just Listed">Just Listed</option>
            <option value="Rare Spec">Rare Spec</option>
            <option value="1 of #__">1 of #__</option>
          </select>
          <input id="user-tag-number" type="number" placeholder="#" className="w-16 md:w-20 px-2 md:px-3 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-xs md:text-sm" min="1" />
          <button type="button" onClick={() => {
            const typeEl = document.getElementById('user-tag-type') as HTMLSelectElement;
            const numEl = document.getElementById('user-tag-number') as HTMLInputElement;
            if (!typeEl || !typeEl.value) return;
            const newTag: { type: string; number?: number } = { type: typeEl.value };
            if (typeEl.value === '1 of #__' && numEl.value) newTag.number = parseInt(numEl.value);
            setListingTags([...listingTags, newTag]);
            typeEl.value = '';
            numEl.value = '';
          }} className="px-3 md:px-4 py-2 md:py-2.5 bg-[var(--color-shelby-blue)] text-white text-xs md:text-sm font-bold rounded-lg hover:bg-[#001D40] transition-colors">Add</button>
        </div>
      </div>

      <div className="bg-gray-50/50 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3 border border-gray-200 hover:border-[var(--color-shelby-blue)] hover:bg-blue-50/20 transition-colors">
        <input type="checkbox" {...register("legal_confirm", { required: true })} className="mt-0.5 w-4 h-4 md:w-5 md:h-5 accent-[var(--color-shelby-blue)] cursor-pointer shrink-0" />
        <label className="text-xs md:text-sm text-gray-800 font-medium leading-relaxed">
          I confirm the listing price includes all fees and I hold the legal title to this vehicle.
        </label>
      </div>

      <div className="flex justify-between pt-4 md:pt-6 border-t border-gray-100">
        <button type="button" onClick={onBack} className="px-4 md:px-6 py-2 md:py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-xs md:text-sm">
          &larr; Back
        </button>
        <button type="submit" className="px-6 md:px-8 py-2 md:py-3 bg-[var(--color-shelby-blue)] text-white font-bold rounded-lg hover:bg-[#001D40] transition-colors shadow-lg shadow-blue-900/20 active:scale-95 text-xs md:text-sm">
          Choose Package &rarr;
        </button>
      </div>
    </form>
  );
}
