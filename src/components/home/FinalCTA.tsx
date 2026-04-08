import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden border-t-8 border-[var(--color-shelby-red)]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-[var(--color-shelby-blue)]/85 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        <h2 className="font-heading font-extrabold text-white text-5xl md:text-6xl tracking-tighter uppercase mb-6 drop-shadow-lg">
          Ready to find your dream Shelby?
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl font-light drop-shadow-md">
          Create an account today to unlock full vehicle histories, view detailed high-resolution galleries, and contact sellers directly.
        </p>
        <Link href="/signup" className="px-12 py-5 bg-white text-[var(--color-shelby-blue)] hover:bg-gray-100 font-bold text-lg rounded-xl shadow-2xl transition-all hover:scale-105 uppercase tracking-wide flex items-center gap-2">
          Create Free Account
        </Link>
      </div>
    </section>
  );
}
