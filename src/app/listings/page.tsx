"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, ShieldCheck, X, SlidersHorizontal } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

const ALL_CARS = [
  { id: 1, image: '/images/Shelby-GT500-for-Sale-2022-Ford-Mustang-Shelby-GT500-Front.jpg', title: '2022 Shelby GT500', subtitle: 'Heritage Edition', price: 114950, year: 2022, miles: 1240, trans: 'Automatic', drive: 'RWD', model: 'GT500', dealer: 'Shelby American Direct', location: 'Scottsdale, AZ', tags: ['Certified', 'New Arrival'] },
  { id: 2, image: '/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg', title: '2020 Shelby GT350R', subtitle: 'Carbon Fiber Track Pack', price: 98000, year: 2020, miles: 4500, trans: 'Manual', drive: 'RWD', model: 'GT350', dealer: 'Performance Classics', location: 'Miami, FL', tags: [] },
  { id: 3, image: '/images/ford-mustang-shelby-gt500-super-snake1-e1526674717750.webp', title: '2023 Shelby Super Snake', subtitle: '825HP Package', price: 142000, year: 2023, miles: 150, trans: 'Manual', drive: 'RWD', model: 'Super Snake', dealer: 'Shelby Signature Gallery', location: 'Las Vegas, NV', tags: ['Certified', 'New Arrival'] },
  { id: 4, image: '/images/rare-rides-the-1967-shelby-gt500-super-snake-2020-12-14_03-04-23_399335.webp', title: '1967 Shelby GT500', subtitle: 'Eleanor Tribute', price: 285000, year: 1967, miles: 12000, trans: 'Manual', drive: 'RWD', model: 'GT500', dealer: 'Heritage Motors', location: 'Austin, TX', tags: [] },
  { id: 5, image: '/images/2013_Shelby_GT500_Cobra_frt_34.webp', title: '2021 Shelby GT500', subtitle: 'Signature Edition', price: 129000, year: 2021, miles: 890, trans: 'Automatic', drive: 'RWD', model: 'GT500', dealer: 'Windy City Shelby', location: 'Chicago, IL', tags: ['Certified'] },
  { id: 6, image: '/images/2026_supersnaker_gallery_06-938430.jpg', title: '2024 Shelby F-150', subtitle: 'Supercharged', price: 135000, year: 2024, miles: 15, trans: 'Automatic', drive: '4WD', model: 'F-150', dealer: 'Rocky Mountain Performance', location: 'Denver, CO', tags: ['New Arrival'] },
  { id: 7, image: '/images/1967-ford-shelby-gt500-super-snake.avif', title: '2023 Shelby Cobra Jet', subtitle: '1300 Drag Pack', price: 195000, year: 2023, miles: 50, trans: 'Automatic', drive: 'RWD', model: 'Cobra Jet', dealer: 'Track Attack Motors', location: 'Houston, TX', tags: ['Certified'] },
  { id: 8, image: '/images/2019-ford-mustang-shelby-gt-s-lead2-1566224220.avif', title: '2019 Shelby GT350', subtitle: 'R-Spec Package', price: 78500, year: 2019, miles: 8200, trans: 'Manual', drive: 'RWD', model: 'GT350', dealer: 'Carroll Shelby Imports', location: 'Los Angeles, CA', tags: [] },
  { id: 9, image: '/images/1_Rw-9_7gZZDN7hY-PNMdlMg.jpg', title: '1968 Shelby GT500KR', subtitle: 'King of the Road', price: 340000, year: 1968, miles: 45000, trans: 'Manual', drive: 'RWD', model: 'GT500', dealer: 'Classic Shelby Collection', location: 'Nashville, TN', tags: ['Certified'] },
];

const MODELS = ['GT500', 'GT350', 'Super Snake', 'F-150', 'Cobra Jet'];
const YEAR_RANGES = ['2020-2024', '2015-2019', '2010-2014', 'Classic (Pre-2000)'];

export default function ListingsPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTrans, setSelectedTrans] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const activeFilters = [...selectedModels.map(m => `Shelby ${m}`), ...selectedYears, ...selectedTrans];

  const filtered = useMemo(() => {
    let result = ALL_CARS.filter(car => {
      if (selectedModels.length && !selectedModels.includes(car.model)) return false;
      if (selectedTrans.length && !selectedTrans.includes(car.trans)) return false;
      if (car.price < priceMin || car.price > priceMax) return false;
      if (selectedYears.length) {
        const inRange = selectedYears.some(yr => {
          if (yr === '2020-2024') return car.year >= 2020 && car.year <= 2024;
          if (yr === '2015-2019') return car.year >= 2015 && car.year <= 2019;
          if (yr === '2010-2014') return car.year >= 2010 && car.year <= 2014;
          if (yr === 'Classic (Pre-2000)') return car.year < 2000;
          return false;
        });
        if (!inRange) return false;
      }
      return true;
    });
    if (sortBy === "newest") result.sort((a, b) => b.year - a.year);
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "miles-low") result.sort((a, b) => a.miles - b.miles);
    return result;
  }, [selectedModels, selectedYears, selectedTrans, priceMin, priceMax, sortBy]);

  const clearAll = () => { setSelectedModels([]); setSelectedYears([]); setSelectedTrans([]); setPriceMin(0); setPriceMax(500000); };

  const FilterPanel = () => (
    <aside className="w-full lg:w-[300px] shrink-0 space-y-6">
      {/* Model */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Shelby Model</h3>
        <div className="space-y-3">
          {MODELS.map(model => (
            <label key={model} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={selectedModels.includes(model)} onChange={() => toggleFilter(selectedModels, model, setSelectedModels)} className="w-4 h-4 rounded border-[#565d6d] accent-[#002D72]" />
                <span className="text-xs font-medium">{model}</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#f3f4f6] rounded text-[10px] font-bold">{ALL_CARS.filter(c => c.model === model).length}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Year */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Production Year</h3>
        <div className="grid grid-cols-2 gap-3">
          {YEAR_RANGES.map(yr => (
            <label key={yr} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedYears.includes(yr)} onChange={() => toggleFilter(selectedYears, yr, setSelectedYears)} className="w-4 h-4 rounded border-[#565d6d] accent-[#002D72]" />
              <span className="text-xs font-medium">{yr}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Transmission */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Transmission</h3>
        <div className="flex gap-6">
          {['Manual', 'Automatic'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedTrans.includes(type)} onChange={() => toggleFilter(selectedTrans, type, setSelectedTrans)} className="w-4 h-4 rounded border-[#565d6d] accent-[#002D72]" />
              <span className="text-xs font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Price */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Price Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-[#565d6d]">Min</label>
            <input type="number" value={priceMin} onChange={e => setPriceMin(Number(e.target.value))} className="mt-1 w-full h-9 px-3 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72]" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-[#565d6d]">Max</label>
            <input type="number" value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="mt-1 w-full h-9 px-3 border border-[#dee1e6] rounded-lg text-sm focus:outline-none focus:border-[#002D72]" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <button onClick={clearAll} className="w-full h-10 text-[#565d6d] text-xs font-medium hover:text-[#002D72] transition-colors">Clear All Filters</button>
      </div>
    </aside>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-[#dee1e6] rounded-lg text-sm font-bold">
        <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilters.length > 0 && <span className="px-2 py-0.5 bg-[#E31837] text-white text-[10px] rounded-full">{activeFilters.length}</span>}
      </button>

      {/* Sidebar Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}><FilterPanel /></div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{filtered.length} Ford Shelbys Available</h1>
            <p className="text-sm text-[#565d6d] mt-1">Found matching your criteria across verified dealers</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 px-4 bg-white border border-[#dee1e6] rounded-lg text-xs font-bold focus:outline-none focus:border-[#002D72]">
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="miles-low">Miles: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#565d6d]">Active:</span>
            {activeFilters.map(f => (
              <div key={f} className="flex items-center gap-2 px-3 py-1 bg-[#002D72]/5 border border-[#002D72]/10 rounded-full text-[11px] font-semibold text-[#002D72]">
                {f}
                <button onClick={() => { setSelectedModels(sm => sm.filter(m => `Shelby ${m}` !== f)); setSelectedYears(sy => sy.filter(y => y !== f)); setSelectedTrans(st => st.filter(t => t !== f)); }} className="hover:text-[#E31837]"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={clearAll} className="text-[10px] font-bold text-[#E31837] ml-2">Reset</button>
          </div>
        )}

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(car => (
            <Link key={car.id} href={`/listings/${car.id}`} className="bg-white rounded-xl border border-[#dee1e6] overflow-hidden flex flex-col card-shadow">
              <div className="relative aspect-[1.6] bg-[#f3f4f6]">
                <img src={car.image} className="w-full h-full object-cover" alt={car.title} />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {car.tags.includes('Certified') && <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold">Certified</div>}
                  {car.tags.includes('New Arrival') && <div className="px-3 py-1 bg-[#E31837] rounded-lg text-[10px] font-bold text-white">New Arrival</div>}
                </div>
                <div className="absolute top-3 right-3" onClick={e => e.preventDefault()}>
                  <FavoriteButton listingId={String(car.id)} />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                  <h3 className="text-lg font-bold tracking-tight break-words">{car.title}</h3>
                  <span className="text-xl font-extrabold text-[#E31837] font-heading whitespace-nowrap shrink-0">${car.price.toLocaleString()}</span>
                </div>
                <p className="text-sm font-medium text-[#565d6d] mb-4 break-words">{car.subtitle}</p>
                <div className="py-3 border-y border-[#dee1e6] flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[#565d6d]">
                  <span>{car.miles.toLocaleString()} mi</span><div className="h-3 w-px bg-[#dee1e6]" />
                  <span>{car.trans}</span><div className="h-3 w-px bg-[#dee1e6]" />
                  <span>{car.drive}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#f3f4f6] rounded flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-[#002D72]" /></div>
                  <div>
                    <div className="text-[10px] font-bold">{car.dealer}</div>
                    <div className="flex items-center gap-1 text-[10px] text-[#565d6d]"><MapPin className="w-2.5 h-2.5" />{car.location}</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 border-t border-[#dee1e6]">
                  <span className="h-12 flex items-center justify-center text-xs font-bold hover:bg-gray-50 transition-colors">View Details</span>
                  <span className="h-12 flex items-center justify-center bg-[#002D72] text-white text-xs font-bold hover:bg-[#001D4A] transition-colors">Contact Seller</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4 text-[#dee1e6]" />
            <h3 className="text-xl font-bold mb-2">No vehicles found</h3>
            <p className="text-[#565d6d] mb-6">Try adjusting your filters to see more results.</p>
            <button onClick={clearAll} className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-lg">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
