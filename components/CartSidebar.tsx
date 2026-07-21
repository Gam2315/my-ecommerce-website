"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, isGuest } = useCart();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsCartOpen]);

  // Prevent background scrolling when open only on mobile
  useEffect(() => {
    if (isCartOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop (visible mostly on mobile or as a subtle overlay) */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 md:bg-transparent ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Mini Window */}
      <div 
        className={`fixed top-[72px] right-4 md:right-8 w-full max-w-[380px] max-h-[calc(100vh-100px)] bg-white dark:bg-gray-900 z-50 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right overflow-hidden ${
          isCartOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {isGuest ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-4 py-8">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag size={28} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm">You must log in to view your cart.</p>
              <Link 
                href="/login"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-full"
              >
                Log In or Sign Up
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[30vh] text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 text-[#e6193c] text-sm font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                    <Image
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                          <Link href={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="hover:text-[#e6193c] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                          <span>Size: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.size}</span></span>
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          <span>₱{item.price.toFixed(2)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-[#e6193c] transition-colors p-1 -mt-1 -mr-1"
                        aria-label="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white mb-5">
              <span>Subtotal</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-5">
              Taxes and shipping calculated at checkout.
            </p>

            <Link href={isGuest ? "/login?redirect=/checkout" : "/checkout"}>
              <button 
                className="w-full bg-[#e6193c] text-white font-bold tracking-wider py-4 rounded-md hover:bg-black dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                onClick={() => setIsCartOpen(false)}
              >
                PROCEED TO CHECKOUT
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
