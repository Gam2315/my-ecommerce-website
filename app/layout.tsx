import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XtraFashion — Admire Stylish Dresses & Looks",
  description:
    "Discover the latest fashion trends at XtraFashion. Shop stylish dresses, coats, and looks for women, men, and kids. Black Friday deals and exclusive collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
