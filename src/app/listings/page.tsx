"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, ShieldCheck, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CompareButton } from "@/components/CompareButton";

interface Listing {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number;
  transmission: string;
  drivetrain: string;
  location: string | null;
  status: string;
  is_featured: boolean;
  primary_image_url: string | null;
  dealership_name: string | null;
  vin: string;
}

const MODELS = ['GT500', 'GT350', 'Super Snake', 'F-150', 'Cobra Jet'];
const YEAR_RANGES = ['2020-2024', '2015-2019', '2010-2014', 'Classic (Pre-2000)'];
const DRIVETRAINS = ['RWD', 'AWD', 'FWD'];
const MILEAGE_RANGES = [
  { label: '0 - 5,000', min: 0, max: 5000 },
  { label: '5,000 - 15,000', min: 5000, max: 15000 },
  { label: '15,000 - 30,000', min: 15000, max: 30000 },
  { label: '30,000 - 50,000', min: 30000, max: 50000 },
  { label: '50,000+', min: 50000, max: 999999 },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTrans, setSelectedTrans] = useState<string[]>([]);
  const [selectedDrivetrains, setSelectedDrivetrains] = useState<string[]>([]);
  const [selectedMileage, setSelectedMileage] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Use server API to avoid client-side Supabase issues
      const res = await fetch('/api/debug-listings');
      const result = await res.json();

      console.log('API Response:', result);
      
      // Filter to ACTIVE
      const activeListings = (result.data || []).filter((l: any) => l.status === 'ACTIVE');
      setListings(activeListings);
      
      if (result.error) {
        console.error('API error:', result.error);
        setError(result.error);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const activeFilters = [
    ...selectedModels.map(m => `Shelby ${m}`),
    ...selectedYears,
    ...selectedTrans,
    ...selectedDrivetrains,
    ...selectedMileage.map(m => `Mileage: ${m}`),
  ];

  const filtered = useMemo(() => {
    const result = listings.filter(car => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.year.toString().includes(searchLower) ||
          car.vin?.toLowerCase().includes(searchLower) ||
          car.location?.toLowerCase().includes(searchLower) ||
          car.trim?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      if (selectedModels.length && !selectedModels.some(m => car.model.includes(m))) return false;
      if (selectedTrans.length && !selectedTrans.includes(car.transmission)) return false;
      if (selectedDrivetrains.length && !selectedDrivetrains.includes(car.drivetrain)) return false;
      if (car.price < priceMin || car.price > priceMax) return false;
      if (selectedMileage.length) {
        const inMileageRange = selectedMileage.some(rangeLabel => {
          const range = MILEAGE_RANGES.find(r => r.label === rangeLabel);
          if (!range) return false;
          return car.mileage >= range.min && car.mileage <= range.max;
        });
        if (!inMileageRange) return false;
      }
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
    if (sortBy === "miles-low") result.sort((a, b) => a.mileage - b.mileage);
    return result;
  }, [listings, selectedModels, selectedYears, selectedTrans, selectedDrivetrains, selectedMileage, priceMin, priceMax, sortBy, searchQuery]);

  const clearAll = () => { 
    setSelectedModels([]); 
    setSelectedYears([]); 
    setSelectedTrans([]); 
    setSelectedDrivetrains([]);
    setSelectedMileage([]);
    setPriceMin(0); 
    setPriceMax(500000); 
  };

  const getModelFromTitle = (make: string, model: string) => {
    const fullModel = `${make} ${model}`;
    if (fullModel.includes('GT500')) return 'GT500';
    if (fullModel.includes('GT350')) return 'GT350';
    if (fullModel.includes('Super Snake')) return 'Super Snake';
    if (fullModel.includes('F-150')) return 'F-150';
    if (fullModel.includes('Cobra')) return 'Cobra Jet';
    return model;
  };

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
              <span className="px-1.5 py-0.5 bg-[#f3f4f6] rounded text-[10px] font-bold">
                {listings.filter(c => getModelFromTitle(c.make, c.model) === model).length}
              </span>
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
      {/* Drivetrain */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Drivetrain</h3>
        <div className="flex flex-wrap gap-3">
          {DRIVETRAINS.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedDrivetrains.includes(type)} onChange={() => toggleFilter(selectedDrivetrains, type, setSelectedDrivetrains)} className="w-4 h-4 rounded border-[#565d6d] accent-[#002D72]" />
              <span className="text-xs font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Mileage */}
      <div className="border-b border-[#dee1e6] pb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4">Mileage</h3>
        <div className="space-y-2">
          {MILEAGE_RANGES.map(range => (
            <label key={range.label} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={selectedMileage.includes(range.label)} onChange={() => toggleFilter(selectedMileage, range.label, setSelectedMileage)} className="w-4 h-4 rounded border-[#565d6d] accent-[#002D72]" />
                <span className="text-xs font-medium">{range.label} miles</span>
              </div>
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

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#002D72] mx-auto mb-4" />
          <p className="text-[#565d6d] font-medium">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Error loading listings</h2>
        <p className="text-[#565d6d] mb-6">{error}</p>
        <button onClick={fetchListings} className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : `${filtered.length} Ford Shelbys Available`}
            </h1>
            <p className="text-sm text-[#565d6d] mt-1">
              {searchQuery ? `${filtered.length} vehicles found` : 'Found matching your criteria across verified dealers'}
            </p>
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
                <img 
                  src={car.primary_image_url || '/images/logo.png'} 
                  className="w-full h-full object-cover" 
                  alt={`${car.year} ${car.make} ${car.model}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.png'; }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {car.is_featured && <div className="px-3 py-1 bg-[#E31837] rounded-lg text-[10px] font-bold text-white">Featured</div>}
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-2" onClick={e => e.preventDefault()}>
                  <FavoriteButton listingId={car.id} />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                  <h3 className="text-lg font-bold tracking-tight break-words">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <span className="text-xl font-extrabold text-[#E31837] font-heading whitespace-nowrap shrink-0">
                    ${car.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#565d6d] mb-4 break-words">
                  {car.trim || 'Standard Edition'}
                </p>
                <div className="py-3 border-y border-[#dee1e6] flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[#565d6d]">
                  <span>{car.mileage.toLocaleString()} mi</span>
                  <div className="h-3 w-px bg-[#dee1e6]" />
                  <span>{car.transmission}</span>
                  <div className="h-3 w-px bg-[#dee1e6]" />
                  <span>{car.drivetrain}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f3f4f6] rounded flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-[#002D72]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold">
                        {car.dealership_name || 'Private Seller'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#565d6d]">
                        <MapPin className="w-2.5 h-2.5" />
                        {car.location || 'Location not specified'}
                      </div>
                    </div>
                  </div>
                  <div onClick={e => e.preventDefault()}>
                    <CompareButton listing={car} />
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

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#002D72] mx-auto mb-4" />
          <p className="text-[#565d6d] font-medium">Loading listings...</p>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
