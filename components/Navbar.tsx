"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { itemCount, setIsCartOpen, isCartOpen } = useCart();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session,
    // so no separate getUser() call is needed.
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

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image, price")
        .ilike("name", `%${searchQuery.trim()}%`)
        .limit(5);

      if (!error && data) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    const timeoutId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
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

          {/* Search Bar */}
          <div className="flex items-center" ref={searchContainerRef}>
            {isSearchOpen ? (
              <div className="absolute top-0 left-0 w-full bg-white dark:bg-[#0a0a0a] z-50 shadow-sm flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
                <div className="w-full h-16 flex items-center justify-center px-5 lg:px-8">
                  <form onSubmit={handleSearchSubmit} className="w-full max-w-[800px] flex items-center gap-3">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input 
                      type="text" 
                      name="q"
                      placeholder="Search for products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-[#333] dark:text-white text-[15px] outline-none placeholder:text-gray-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-[#333] dark:text-gray-300 transition-colors hover:text-[#e6193c] dark:hover:text-[#e6193c] p-2 flex-shrink-0"
                      aria-label="Close Search"
                    >
                      <X size={20} />
                    </button>
                  </form>
                </div>
                
                {searchQuery.trim().length >= 2 && (
                  <div className="w-full max-w-[800px] bg-white dark:bg-[#0a0a0a] px-5 lg:px-8 py-4 shadow-xl lg:rounded-b-lg border-x border-b border-gray-100 dark:border-gray-800 max-h-[70vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="py-4 text-sm text-gray-500 text-center">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchResults.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/product/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                          >
                            <div className="w-12 h-12 relative bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                              {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                              ) : null}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-black dark:text-white line-clamp-1">{product.name}</h4>
                              <p className="text-xs font-medium text-[#e6193c] mt-0.5">{product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}</p>
                            </div>
                          </Link>
                        ))}
                        <button 
                          onClick={handleSearchSubmit}
                          className="mt-2 text-sm text-center py-2.5 text-[#333] dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    ) : (
                      <div className="py-4 text-sm text-gray-500 text-center">No products found for "{searchQuery}"</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setMobileOpen(false);
                }}
                className="text-[#333] dark:text-gray-300 transition-colors hover:text-[#e6193c] dark:hover:text-[#e6193c]"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.8} />
              </button>
            )}
          </div>

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

