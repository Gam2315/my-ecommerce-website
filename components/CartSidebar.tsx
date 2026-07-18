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

  // Prevent background scrolling when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {isGuest ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <ShoppingBag size={48} className="text-gray-200" />
              <p>You must log in to view your cart.</p>
              <Link 
                href="/login"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Log In or Sign Up
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <ShoppingBag size={48} className="text-gray-200" />
              <p>Your cart is currently empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 relative bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {item.size && (
                        <p className="text-sm text-gray-500 mt-1">Size: <span className="font-medium text-gray-900">{item.size}</span></p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-[#e6193c]">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">₱{cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Shipping and taxes calculated at checkout.</p>
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-4 text-center text-sm font-bold tracking-widest uppercase text-white bg-[#e6193c] hover:bg-[#c41432] transition-colors rounded-md"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
