import { Gauge, Settings, Palette, Zap } from "lucide-react";

interface Specs {
  mileage: number;
  engine: string;
  transmission: string;
  color: string;
}

export default function VDPSpecCards({ specs }: { specs: Specs }) {
  const cards = [
    { label: "Mileage", value: `${specs.mileage.toLocaleString()} mi`, icon: Gauge },
    { label: "Engine", value: specs.engine, icon: Zap },
    { label: "Transmission", value: specs.transmission, icon: Settings },
    { label: "Exterior Color", value: specs.color, icon: Palette },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-start hover:border-[var(--color-shelby-blue)] hover:shadow-md transition-all">
          <div className="bg-gray-200 p-2.5 rounded-lg mb-4 text-[var(--color-shelby-blue)]">
            <card.icon className="w-6 h-6" />
          </div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">{card.label}</p>
          <p className="font-heading font-bold text-gray-900 text-lg leading-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
