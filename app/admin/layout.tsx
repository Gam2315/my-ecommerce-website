"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  ArrowLeft,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Discounts", href: "/admin/discounts", icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 font-[family-name:var(--font-inter)]">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Admin Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-2 select-none">
            <span className="flex h-6 w-6 items-center justify-center border-2 border-black text-[10px] font-black bg-black text-white rounded-sm">
              X
            </span>
            <span className="text-[14px] font-bold tracking-wide text-black">
              ADMIN
            </span>
          </Link>
          <button 
            className="lg:hidden text-gray-500 hover:text-black"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#e6193c]/10 text-[#e6193c]" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link 
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Store
          </Link>
          <button 
            onClick={async () => {
              const { createClient } = await import('@/utils/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button 
            className="text-gray-500 hover:text-black p-2 -ml-2"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="font-bold ml-2">XtraFashion Admin</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
