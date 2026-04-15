"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { decodeVin } from "@/lib/nhtsa/api";
import { Loader2 } from "lucide-react";

export default function Step1VIN({ initialData, onNext }: any) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ defaultValues: initialData });

  const currentVin = watch("vin");

  const handleLookup = async () => {
    if (!currentVin || currentVin.length < 17) return alert("Enter valid 17-char VIN");
    setLoading(true);
    const data = await decodeVin(currentVin);
    if (data.year) setValue("year", data.year);
    if (data.make) setValue("make", data.make);
    if (data.model) setValue("model", data.model);
    if (data.trim) setValue("trim", data.trim);
    if (data.engine) setValue("engine", data.engine);
    setLoading(false);
  };

  const onSubmit = (data: any) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 break-words">Vehicle Identification Number (VIN)</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            {...register("vin", { required: true, minLength: 17, maxLength: 17 })}
            placeholder="17-Character VIN"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none font-mono uppercase text-sm transition-shadow bg-white shadow-inner min-w-0"
            maxLength={17}
          />
          <button type="button" onClick={handleLookup} disabled={loading} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[120px] shadow-md text-sm">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Decode VIN"}
          </button>
        </div>
        {errors.vin && <p className="text-red-500 text-sm mt-2 font-medium">Valid 17-character VIN is required.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Year</label>
          <input type="number" {...register("year", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none transition-shadow text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Make</label>
          <input type="text" {...register("make", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none transition-shadow text-sm font-bold text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Model</label>
          <input type="text" {...register("model", { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none transition-shadow text-sm font-bold text-[var(--color-shelby-blue)]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Trim (Optional)</label>
          <input type="text" {...register("trim")} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none transition-shadow text-sm" placeholder="e.g. GT350R" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Engine</label>
          <input type="text" {...register("engine")} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-shelby-blue)] outline-none transition-shadow text-sm" placeholder="Auto-filled from VIN" />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button type="submit" className="px-8 py-3 bg-[var(--color-shelby-blue)] text-white font-bold rounded-lg hover:bg-[#001D40] transition-colors shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 text-sm">
          Continue to Photos & Specs &rarr;
        </button>
      </div>
    </form>
  );
}
