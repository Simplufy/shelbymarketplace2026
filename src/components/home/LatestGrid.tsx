import Link from "next/link";

const MOCK_LATEST = [
  { id: "4", year: 2017, make: "Ford Shelby", model: "GT350R", price: 89000, mileage: 8500, img: "https://images.unsplash.com/photo-1549491630-d02c77174e99?q=80&w=400&auto=format&fit=crop" },
  { id: "5", year: 2022, make: "Ford Shelby", model: "F-150 Super Snake", price: 110000, mileage: 4200, img: "https://images.unsplash.com/photo-1606016159991-efa6ecbd2e0b?q=80&w=400&auto=format&fit=crop" },
  { id: "6", year: 2008, make: "Ford Shelby", model: "GT500KR", price: 65000, mileage: 12000, img: "https://images.unsplash.com/photo-1525605273760-4b53faae2eb0?q=80&w=400&auto=format&fit=crop" },
  { id: "7", year: 2019, make: "Ford Shelby", model: "Super Snake", price: 135000, mileage: 2200, img: "https://images.unsplash.com/photo-1627402094719-74e17f5a5c60?q=80&w=400&auto=format&fit=crop" },
];

export default function LatestGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="font-heading font-extrabold text-3xl tracking-tighter text-gray-900 uppercase mb-12 border-b-[3px] border-[var(--color-shelby-blue)] inline-block pb-2">
          Latest Listings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {MOCK_LATEST.map((car) => (
            <Link key={car.id} href={`/listings/${car.id}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                <img src={car.img} alt={`${car.year} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-xl text-gray-900 group-hover:text-[var(--color-shelby-blue)] transition-colors truncate">
                {car.year} {car.make} {car.model}
              </h4>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="font-heading font-bold text-2xl text-[var(--color-shelby-red)]">
                  ${car.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                  {car.mileage.toLocaleString()} mi
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/listings" className="inline-flex items-center justify-center px-10 py-4 bg-white border-2 border-gray-200 text-gray-800 font-bold uppercase tracking-wide text-sm rounded-xl hover:border-[var(--color-shelby-blue)] hover:text-[var(--color-shelby-blue)] hover:shadow-lg transition-all">
            View All Inventory
          </Link>
        </div>
      </div>
    </section>
  );
}
