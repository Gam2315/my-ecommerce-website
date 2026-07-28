"use client";

import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "WOMEN", href: "/category/women" },
  { label: "MEN", href: "/category/men" },
  { label: "KIDS", href: "/category/kids" },
  { label: "SHOES", href: "/category/shoes" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "PERFUMES", href: "/category/perfumes" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { itemCount, setIsCartOpen, isCartOpen } = useCart();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email,
          picture: data.user.user_metadata?.avatar_url,
          given_name: data.user.user_metadata?.full_name?.split(' ')[0] || data.user.email?.split('@')[0]
        });
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email,
          picture: session.user.user_metadata?.avatar_url,
          given_name: session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <header
        id="navbar"
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors"
      >
      <div className="mx-auto flex h-16 max-w-[1340px] items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <span
            className="flex h-7 w-7 items-center justify-center border-2 border-black dark:border-white text-[11px] font-black leading-none text-black dark:text-white"
            style={{ borderRadius: 3 }}
          >
            X
          </span>
          <span className="text-[15px] font-extrabold tracking-wide text-black dark:text-white">
            TRAFASHION<span className="text-black dark:text-white">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-[13px] font-semibold tracking-wide transition-colors ${isActive ? 'text-[#e6193c]' : 'text-gray-800 dark:text-gray-300'}`}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#e6193c";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden items-center gap-2 md:flex relative group cursor-pointer">
              {user.picture ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                  <Image src={user.picture} alt={user.name || "User"} width={24} height={24} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-500">
                  {user.given_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[13px] font-medium text-[#333]">
                {user.given_name}
              </span>

              <div className="absolute top-full right-0 pt-4 hidden group-hover:block">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md rounded-md overflow-hidden flex flex-col w-32">
                  <Link
                    href="/account"
                    className="py-2.5 px-4 text-sm text-[#333] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#e6193c] transition-colors whitespace-nowrap border-b border-gray-50 dark:border-gray-800"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2.5 px-4 flex items-center gap-2 text-sm text-[#333] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#e6193c] transition-colors whitespace-nowrap text-left"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 text-[13px] font-medium text-[#333] dark:text-gray-300 transition-colors hover:text-[#e6193c] dark:hover:text-[#e6193c] md:flex"
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.8} />
              <span>Account</span>
            </Link>
          )}

          <ThemeToggle />

          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative flex items-center gap-1.5 text-[13px] font-medium text-[#333] dark:text-gray-300 transition-colors hover:text-[#e6193c] dark:hover:text-[#e6193c]"
            aria-label="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            <span className="hidden md:inline">Cart</span>
            {/* Badge */}
            {itemCount > 0 && (
              <span
                className="absolute -right-2.5 -top-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: "#e6193c" }}
              >
                {itemCount}
              </span>
            )}
          </button>

          <button
            className="text-[#333] dark:text-gray-300 transition-colors hover:text-[#e6193c] dark:hover:text-[#e6193c]"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="text-[#333] dark:text-gray-300 md:hidden relative w-[22px] h-[22px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <div className={`absolute transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
              <Menu size={22} />
            </div>
            <div className={`absolute transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
              <X size={22} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-6 py-4 shadow-inner">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`py-2 text-[14px] font-semibold tracking-wide ${isActive ? 'text-[#e6193c]' : 'text-gray-800 dark:text-gray-300'}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="flex flex-col border-t border-gray-50 dark:border-gray-800 mt-2">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-[14px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 text-left"
              >
                MY ACCOUNT
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 text-[14px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 text-left border-t border-gray-50 dark:border-gray-800"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-[14px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 text-left mt-2 border-t border-gray-50 dark:border-gray-800 block"
            >
              LOGIN / ACCOUNT
            </Link>
          )}
        </nav>
      </div>
      </header>
    </>
  );
}

