"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Queen Anato Crest",
    category: "New Arrival",
    price: "$16",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=520&fit=crop",
    discount: "29%",
    hasSaleBanner: true,
    alt: "Woman in white top and wide pants",
  },
  {
    id: 2,
    name: "Marco Tank",
    category: "Exclusive",
    price: "$71",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=520&fit=crop",
    discount: null,
    hasSaleBanner: false,
    alt: "Woman in crop top and denim skirt",
  },
  {
    id: 3,
    name: "Jack by Dakota",
    category: "Women",
    price: "$75",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=520&fit=crop",
    discount: null,
    hasSaleBanner: false,
    alt: "Woman in floral top and navy pants",
  },
  {
    id: 4,
    name: "The Trucker",
    category: "Limited Edition",
    price: "$72",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=520&fit=crop",
    discount: "9%",
    hasSaleBanner: true,
    alt: "Man in black turtleneck and grey pants",
  },
];

function SaleBanner({ discount }: { discount: string }) {
  const text = `SALE ${discount} OFF ⚡ HOT SALE ${discount} OFF ⚡ `;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden bg-black/85 py-1.5">
      <div className="sale-ticker-track">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="px-1 text-[11px] font-bold tracking-wider text-white"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BestSellers() {
  return (
    <section id="best-sellers" className="relative w-full bg-white py-20">
      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-x-0 top-8 overflow-hidden">
        <div className="marquee-track">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="watermark-text mx-8">
              XTRA FASHION
            </span>
          ))}
          {[...Array(3)].map((_, i) => (
            <span key={`dup-${i}`} className="watermark-text mx-8">
              XTRA FASHION
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* Heading */}
        <h2 className="mb-12 text-center text-[2.2rem] tracking-tight text-black font-[family-name:var(--font-playfair)]">
          Our{" "}
          <span className="font-bold">Best Sellers</span>
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group">
              {/* Card */}
              <div className="product-card relative aspect-[3/4] w-full overflow-hidden">
                {/* Sale Badge */}
                {product.discount && (
                  <div className="sale-badge">
                    <span>Sale!</span>
                    <span>{product.discount}</span>
                  </div>
                )}

                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Sale Banner */}
                {product.hasSaleBanner && product.discount && (
                  <SaleBanner discount={product.discount} />
                )}
              </div>

              {/* Info */}
              <div className="mt-3 text-center">
                <h3 className="text-[15px] font-semibold text-black font-[family-name:var(--font-playfair)]">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[12px] text-gray-400">
                  {product.category}
                </p>
                <p className="mt-1 text-[14px] font-bold text-black">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products */}
        <div className="mt-14 flex items-center justify-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[3px] text-[#333]">
            View All Products
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
