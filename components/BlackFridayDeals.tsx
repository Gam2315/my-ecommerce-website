"use client";

import Image from "next/image";

const deals: any[] = [];

export default function BlackFridayDeals({ activeDiscount }: { activeDiscount?: any }) {
  if (!activeDiscount) return null;

  return (
    <section
      id="black-friday"
      className="w-full bg-white dark:bg-[#0a0a0a] py-20 transition-colors"
    >
      <div className="mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="text-[12px] font-bold uppercase tracking-[3px]"
            style={{ color: "#e6193c" }}
          >
            {activeDiscount.name} - {activeDiscount.type === 'Percentage' ? `${activeDiscount.value}% OFF` : `₱${activeDiscount.value} OFF`}
          </span>
          <h2 className="mt-3 text-[2.2rem] tracking-tight text-black dark:text-white font-[family-name:var(--font-playfair)]">
            Your{" "}
            <span className="font-bold">Perfect</span>{" "}
            <span className="font-light italic">Match</span>
          </h2>
        </div>

        {/* Product Grid */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <div key={deal.id} className="product-card group">
                {/* Sale Badge */}
                <div className="sale-badge">
                  <span>{deal.sale}</span>
                  <span>{deal.discount}</span>
                </div>

                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={deal.image}
                    alt={deal.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Enjoy our {activeDiscount.name}! Prices are automatically discounted.</p>
          </div>
        )}
      </div>
    </section>
  );
}
