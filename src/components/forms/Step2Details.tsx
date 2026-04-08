"use client";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";

export default function Step2Details({ initialData, onNext, onBack }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialData });
  const onSubmit = (data: any) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Asking Price ($)</label>
          <input type="number" {...register("price", { required: true })} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-2xl text-[var(--color-shelby-red)]" placeholder="105000" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Mileage</label>
          <input type="number" {...register("mileage", { required: true })} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-bold text-xl" placeholder="2500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Location</label>
        <input type="text" {...register("location", { required: true })} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none text-lg" placeholder="e.g. Las Vegas, NV" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Vehicle Description</label>
        <textarea {...register("description", { required: true })} rows={6} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none resize-none text-lg" placeholder="Describe your Shelby's condition, modifications, history..." />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Photos (Up to 20)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 sm:p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group">
          <UploadCloud className="w-16 h-16 mb-4 text-[var(--color-shelby-blue)] opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110" />
          <p className="font-bold text-gray-800 text-base sm:text-lg mb-1 text-center break-words">Click to upload or drag & drop</p>
          <p className="text-sm font-medium text-gray-500 text-center">High-res JPEG, PNG (max 10MB each)</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl flex items-start gap-4 border border-gray-200 mt-8 hover:border-[var(--color-shelby-blue)] hover:bg-blue-50/20 transition-colors">
        <input type="checkbox" {...register("legal_confirm", { required: true })} className="mt-1 w-6 h-6 accent-[var(--color-shelby-blue)] cursor-pointer shrink-0" />
        <label className="text-sm md:text-base text-gray-800 font-bold leading-relaxed pt-0.5">
          I confirm the listing price includes all fees and I hold the legal title to this vehicle.
        </label>
      </div>

      <div className="flex justify-between pt-10 border-t border-gray-100">
        <button type="button" onClick={onBack} className="px-8 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-lg">
          &larr; Back
        </button>
        <button type="submit" className="px-10 py-5 bg-[var(--color-shelby-blue)] text-white font-bold rounded-xl hover:bg-[#001D40] transition-colors shadow-lg shadow-blue-900/20 active:scale-95 text-lg">
          Choose Package &rarr;
        </button>
      </div>
    </form>
  );
}
