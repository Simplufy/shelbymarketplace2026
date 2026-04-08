import { Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Setup authorization check here for role === 'ADMIN'
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Lock className="w-6 h-6 text-[var(--color-shelby-red)]" />
          <span className="font-heading font-extrabold tracking-widest uppercase">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-4 bg-[var(--color-shelby-blue)] rounded-xl font-bold text-sm tracking-wide">
            Pending Listings
          </Link>
          <Link href="/admin/dealers" className="block px-4 py-4 hover:bg-gray-800 rounded-xl font-bold text-sm tracking-wide text-gray-400 transition-colors border border-transparent hover:border-gray-700">
            Dealer Approvals
          </Link>
          <Link href="/admin/users" className="block px-4 py-4 hover:bg-gray-800 rounded-xl font-bold text-sm tracking-wide text-gray-400 transition-colors border border-transparent hover:border-gray-700">
            User Management
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}
