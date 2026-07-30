"use client";

import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "next-themes";
import CartSidebar from "./CartSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </ThemeProvider>
  );
}
