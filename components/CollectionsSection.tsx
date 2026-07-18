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
              id={col.id}
              className="group flex flex-col items-center justify-center h-56 w-full bg-gray-50 border border-gray-100 rounded-xl cursor-pointer transition-all hover:bg-white hover:shadow-lg"
            >
              <h3 className="text-2xl font-bold tracking-[4px] text-gray-900 group-hover:text-[#e6193c] transition-colors">{col.title}</h3>
              <p className="text-xs text-gray-400 mt-2 tracking-[2px] uppercase">{col.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
