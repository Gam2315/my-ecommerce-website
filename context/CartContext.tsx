"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

export type CartItem = {
  id: string; // unique cart item id (e.g. productId_size)
  productId: number;
  name: string;
  size?: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  itemCount: number;
  isGuest: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cartKey, setCartKey] = useState<string | null>(null);

  const supabase = createClient();

  // Listen for auth changes to determine the storage key
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCartKey(data.user ? `cart_${data.user.id}` : "cart_guest");
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCartKey(session?.user ? `cart_${session.user.id}` : "cart_guest");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Only runs once on mount

  // Load from local storage when cartKey changes
  useEffect(() => {
    if (!cartKey) return; // Wait until we resolve the auth state

    setIsMounted(true);
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
        setItems([]);
      }
    } else {
      // Important: clear items if this new key has no saved cart
      setItems([]);
    }
  }, [cartKey]);

  // Save to local storage on change
  useEffect(() => {
    if (isMounted && cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, isMounted, cartKey]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true); // Auto open cart
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        itemCount,
        isGuest: cartKey === "cart_guest",
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
