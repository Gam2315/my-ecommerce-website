"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export type CartItem = {
  id: string; // unique cart item id (e.g. productId_size)
  productId: number;
  name: string;
  size?: string;
  price: number;
  image: string;
  quantity: number;
  selected?: boolean; // defaults to true
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
  toggleSelectItem: (id: string) => void;
  toggleSelectAll: () => void;
  removeSelectedFromCart: () => void;
  selectedItems: CartItem[];
  selectedTotal: number;
  selectedCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cartKey, setCartKey] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const lastSyncedRef = useRef<string>("");

  const supabase = createClient();

  // Listen for auth changes to determine the storage key and current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user || null;
      setCurrentUser(user);
      setCartKey(user ? `cart_${user.id}` : "cart_guest");
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      setCartKey(user ? `cart_${user.id}` : "cart_guest");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Only runs once on mount

  // Load from local storage and cloud user_metadata when cartKey/currentUser changes
  useEffect(() => {
    if (!cartKey) return; // Wait until we resolve the auth state

    setIsMounted(true);

    const loadCart = async () => {
      let loadedItems: CartItem[] = [];

      // 1. Try loading from local storage for this key
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          loadedItems = JSON.parse(savedCart);
        } catch (e) {
          console.error("Failed to parse local cart", e);
        }
      }

      // 2. If user is logged in, sync with cloud cart from Supabase user_metadata
      if (currentUser && cartKey !== "cart_guest") {
        let cloudCart: CartItem[] = [];
        try {
          // Fetch latest user data from Supabase to get items added from other devices
          const { data: { user: latestUser } } = await supabase.auth.getUser();
          if (latestUser && latestUser.user_metadata && Array.isArray(latestUser.user_metadata.cart)) {
            cloudCart = latestUser.user_metadata.cart;
          } else if (currentUser.user_metadata && Array.isArray(currentUser.user_metadata.cart)) {
            cloudCart = currentUser.user_metadata.cart;
          }
        } catch (e) {
          console.error("Failed to fetch cloud cart", e);
          if (currentUser.user_metadata && Array.isArray(currentUser.user_metadata.cart)) {
            cloudCart = currentUser.user_metadata.cart;
          }
        }

        // 3. Check if there was a guest cart before logging in
        let guestCart: CartItem[] = [];
        const savedGuestCart = localStorage.getItem("cart_guest");
        if (savedGuestCart) {
          try {
            guestCart = JSON.parse(savedGuestCart);
            // Clear guest cart from local storage once we are merging it into the account
            localStorage.removeItem("cart_guest");
          } catch (e) {
            console.error("Failed to parse guest cart", e);
          }
        }

        // Merge carts: combine localCart, cloudCart, and guestCart without duplicates
        const itemMap = new Map<string, CartItem>();
        
        const addItemToMap = (item: CartItem) => {
          if (!item || !item.id) return;
          if (itemMap.has(item.id)) {
            const existing = itemMap.get(item.id)!;
            // Take the higher quantity when merging from different devices or guest sessions
            itemMap.set(item.id, { ...existing, quantity: Math.max(existing.quantity || 1, item.quantity || 1) });
          } else {
            itemMap.set(item.id, { ...item });
          }
        };

        loadedItems.forEach(addItemToMap);
        cloudCart.forEach(addItemToMap);
        guestCart.forEach(addItemToMap);

        loadedItems = Array.from(itemMap.values());
        
        // Update lastSyncedRef so we don't immediately re-sync what we just loaded
        lastSyncedRef.current = JSON.stringify(loadedItems);
      }

      setItems(loadedItems);
    };

    loadCart();
  }, [cartKey]);

  // Re-fetch cart from cloud when the tab/window regains focus (cross-device sync)
  useEffect(() => {
    if (!cartKey || cartKey === "cart_guest" || !currentUser) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const { data: { user: latestUser } } = await supabase.auth.getUser();
        if (latestUser?.user_metadata?.cart && Array.isArray(latestUser.user_metadata.cart)) {
          const cloudCart: CartItem[] = latestUser.user_metadata.cart;
          const cloudString = JSON.stringify(cloudCart);

          // Only update if the cloud cart differs from what we last synced
          if (cloudString !== lastSyncedRef.current) {
            lastSyncedRef.current = cloudString;
            setItems(cloudCart);
            localStorage.setItem(cartKey, cloudString);
          }
        }
      } catch (e) {
        console.error("Failed to refresh cart from cloud on focus", e);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cartKey, currentUser]);

  // Save to local storage and sync to Supabase cloud metadata on change
  useEffect(() => {
    if (!isMounted || !cartKey) return;

    localStorage.setItem(cartKey, JSON.stringify(items));

    // If logged in, sync changes to cloud user_metadata with debounce
    if (currentUser && cartKey !== "cart_guest") {
      const currentString = JSON.stringify(items);
      if (currentString === lastSyncedRef.current) {
        return; // No changes since last load/sync
      }

      const timer = setTimeout(async () => {
        try {
          const { error } = await supabase.auth.updateUser({
            data: {
              cart: items,
            },
          });
          if (!error) {
            lastSyncedRef.current = currentString;
          }
        } catch (e) {
          console.error("Failed to sync cart to cloud", e);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [items, isMounted, cartKey, currentUser]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity, selected: true } : item
        );
      }
      return [...prev, { ...newItem, selected: true }];
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

  const toggleSelectItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: item.selected === false ? true : false } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const areAllSelected = items.every((item) => item.selected !== false);
    setItems((prev) =>
      prev.map((item) => ({ ...item, selected: !areAllSelected }))
    );
  };

  const removeSelectedFromCart = () => {
    setItems((prev) => prev.filter((item) => item.selected === false));
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const selectedItems = items.filter((item) => item.selected !== false);
  const selectedTotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const selectedCount = selectedItems.reduce((count, item) => count + item.quantity, 0);

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
        toggleSelectItem,
        toggleSelectAll,
        removeSelectedFromCart,
        selectedItems,
        selectedTotal,
        selectedCount,
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
