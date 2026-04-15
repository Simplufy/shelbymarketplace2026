import Link from "next/link";
import { Lock } from "lucide-react";

const MOCK_FEATURED = [
  { id: "1", year: 2021, make: "Ford Shelby", model: "GT500", trim: "Carbon Fiber Track Pack", price: 115000, mileage: 2500, location: "Miami, FL", img: "https://images.unsplash.com/photo-1606016159991-efa6ecbd2e0b?q=80&w=800&auto=format&fit=crop" },
  { id: "2", year: 1967, make: "Ford Shelby", model: "GT500", trim: "Eleanor Replica", price: 250000, mileage: 800, location: "Los Angeles, CA", img: "https://images.unsplash.com/photo-1549491630-d02c77174e99?q=80&w=800&auto=format&fit=crop" },
  { id: "3", year: 2023, make: "Ford Shelby", model: "Super Snake", trim: "Widebody", price: 145000, mileage: 50, location: "Dallas, TX", img: "https://images.unsplash.com/photo-1525605273760-4b53faae2eb0?q=80&w=800&auto=format&fit=crop" },
];

export default function FeaturedCarousel() {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-heading font-extrabold text-4xl tracking-tighter text-gray-900 uppercase">
            Featured <span className="text-[var(--color-shelby-red)]">Shelby's</span>
          </h2>
          <Link href="/listings?featured=true" className="text-[var(--color-shelby-blue)] font-bold text-sm tracking-wide uppercase hover:underline">
            View All Featured &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_FEATURED.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group relative border border-gray-100 flex flex-col">
              
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10">
                 <span className="bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md uppercase tracking-wide">
                  New Listing
                </span>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[var(--color-shelby-red)]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md uppercase tracking-wider">
                  Featured
                </span>
              </div>

              {/* Image with zoom */}
              <div className="relative h-72 overflow-hidden bg-gray-200">
                <img src={car.img} alt={`${car.year} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading font-bold text-3xl mb-1 text-gray-900 truncate">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-gray-500 font-medium text-sm mb-5 truncate">{car.trim}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-6 font-medium">
                  <span className="bg-gray-100 px-3 py-1 rounded-md">{car.mileage.toLocaleString()} mi</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-md">{car.location}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-100">
                  <span className="font-heading font-black text-3xl text-[var(--color-shelby-blue)]">
                    ${car.price.toLocaleString()}
                  </span>
                  
                  <Link href={`/login?redirect=/listings/${car.id}`} className="flex items-center gap-2 bg-[var(--color-shelby-blue)] hover:bg-[#001D40] text-white px-5 py-2.5 rounded-lg font-bold transition-colors text-sm shadow-md">
                    <Lock className="w-4 h-4" /> Contact
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
