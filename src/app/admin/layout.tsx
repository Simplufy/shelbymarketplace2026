import { Lock, LayoutDashboard, FileText, Users, Image, Settings, Newspaper, Car } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings", icon: Car },
  { href: "/admin/content", label: "Content Manager", icon: FileText },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/news", label: "News & Articles", icon: Newspaper },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0F172A] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-6 h-6 text-[#E31837]" />
            <span className="font-outfit font-black text-lg tracking-wider uppercase">Admin Portal</span>
          </div>
          <p className="text-xs text-gray-500">Content Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-[#E31837] transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gradient-to-r from-[#002D72] to-[#E31837] p-4 rounded-xl">
            <p className="text-xs font-medium text-white/80 mb-1">Need Help?</p>
            <p className="text-xs text-white/60">Contact support for assistance</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
