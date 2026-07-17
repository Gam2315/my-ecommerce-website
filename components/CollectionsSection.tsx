"use client";

import Image from "next/image";

const collections = [
  {
    id: "women",
    title: "WOMEN",
    subtitle: "Collections",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&h=600&fit=crop",
    alt: "Women's fashion collection",
  },
  {
    id: "kids",
    title: "KIDS",
    subtitle: "Collections",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&h=600&fit=crop",
    alt: "Kids' fashion collection",
  },
  {
    id: "men",
    title: "MEN",
    subtitle: "Collections",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&h=600&fit=crop",
    alt: "Men's fashion collection",
  },
];

export default function CollectionsSection() {
  return (
    <section id="collections" className="relative w-full bg-white py-20">
      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-x-0 top-12 flex justify-center overflow-hidden">
        <span className="watermark-text">COLLECTION</span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="collection-card group relative aspect-[5/6] w-full"
            >
              <Image
                src={col.image}
                alt={col.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="collection-overlay">
                <h3>{col.title}</h3>
                <p>{col.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
