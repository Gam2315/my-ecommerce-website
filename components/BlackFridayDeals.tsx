"use client";

import Image from "next/image";

const deals = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&h=650&fit=crop",
    sale: "Sale!",
    discount: "29%",
    alt: "Woman in stylish outfit posing for fashion shoot",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=650&fit=crop",
    sale: "Sale!",
    discount: "34%",
    alt: "Fashion model in vibrant yellow outfit",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=500&h=650&fit=crop",
    sale: "Sale!",
    discount: "9%",
    alt: "Man in smart casual turtleneck outfit",
  },
];

export default function BlackFridayDeals() {
  return (
    <section
      id="black-friday"
      className="w-full bg-white py-20"
    >
      <div className="mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span
            className="text-[12px] font-bold uppercase tracking-[3px]"
            style={{ color: "#e6193c" }}
          >
            Black Friday Deals
          </span>
          <h2 className="mt-3 text-[2.2rem] tracking-tight text-black font-[family-name:var(--font-playfair)]">
            Your{" "}
            <span className="font-bold">Perfect</span>{" "}
            <span className="font-light italic">Match</span>
          </h2>
        </div>

        {/* Product Grid */}
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
      </div>
    </section>
  );
}
