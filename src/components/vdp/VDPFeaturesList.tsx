import { Check } from "lucide-react";

export default function VDPFeaturesList({ features, specs }: { features: string[], specs: Record<string, string> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
      <div className="lg:col-span-2">
        <h3 className="font-heading font-bold text-2xl text-gray-900 mb-6 uppercase border-b-2 border-gray-100 pb-2">Key Features & Options</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-gray-700 font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-6 uppercase border-b-2 border-gray-200 pb-2">Technical Specifications</h3>
        <div className="space-y-4">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500 font-medium">{key}</span>
              <span className="font-bold text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
