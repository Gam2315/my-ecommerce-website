import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

interface BestSellersProps {
  products: any[];
}

export default function BestSellers({ products }: BestSellersProps) {
  return (
    <section id="best-sellers" className="relative w-full bg-white dark:bg-[#0a0a0a] py-20 transition-colors">
      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-x-0 top-8 overflow-hidden">
        <div className="marquee-track">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="watermark-text mx-8 dark:text-white/5">
              XTRA FASHION
            </span>
          ))}
          {[...Array(3)].map((_, i) => (
            <span key={`dup-${i}`} className="watermark-text mx-8 dark:text-white/5">
              XTRA FASHION
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* Heading */}
        <h2 className="mb-12 text-center text-[2.2rem] tracking-tight text-black dark:text-white font-[family-name:var(--font-playfair)]">
          Our{" "}
          <span className="font-bold">Best Sellers</span>
        </h2>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                {/* Card */}
                <div className="product-card relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                  {/* Sale Badge */}
                  {product.discount && (
                    <div className="sale-badge">
                      <span>Sale!</span>
                      <span>{product.discount}</span>
                    </div>
                  )}

                  <Image
                    src={product.image}
                    alt={product.name || "Product image"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Sale Banner */}
                  {product.hasSaleBanner && product.discount && (
                    <SaleBanner discount={product.discount} />
                  )}
                </div>

                {/* Info */}
                <div className="mt-3 text-center group-hover:opacity-80 transition-opacity">
                  <h3 className="text-[14px] font-semibold text-black dark:text-white font-[family-name:var(--font-playfair)] line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                    {product.sales > 0 ? `${product.sales} Sold` : product.category}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-black dark:text-white">
                    {product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-500 font-medium">No products currently available.</p>
          </div>
        )}

        {/* View All Products */}
        <div className="mt-14 flex items-center justify-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[3px] text-[#333] dark:text-gray-300">
            View All Products
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
