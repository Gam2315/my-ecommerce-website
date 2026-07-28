"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "next-themes";
import CartSidebar from "./CartSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GoogleOAuthProvider clientId={clientId}>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
