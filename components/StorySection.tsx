"use client";

import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";

export default function StorySection() {
  return (
    <section id="story" className="w-full bg-white py-20">
      <div className="mx-auto max-w-[1340px] px-5 lg:px-8">
        {/* View All Deals link */}
        <div className="mb-14 flex items-center justify-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[3px] text-[#333]">
            View All Deals
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight size={14} />
          </span>
        </div>

        {/* Content grid */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Left text */}
          <div className="max-w-lg lg:flex-1">
            <h2 className="text-[2.8rem] leading-[1.15] tracking-tight text-black font-[family-name:var(--font-playfair)] lg:text-[3.2rem]">
              <span className="font-bold">Admire</span>{" "}
              <span className="font-light italic text-gray-400">Stylish</span>
              <span className="ml-6 font-light italic text-gray-400 font-[family-name:var(--font-playfair)]">
                {" "}
                Dresses
              </span>
              <br />
              <span className="font-light font-[family-name:var(--font-playfair)]">
                &{" "}
              </span>
              <span className="font-black font-[family-name:var(--font-playfair)]">
                Looks
              </span>
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-gray-400">
              Fashion is a form of self-expression and autonomy at a particular
              period and place and in a specific context, of clothing, footwear,
              lifestyle, accessories, makeup, hairstyle, and body posture. The
              term implies a look defined by the fashion industry as that which
              is trending.
            </p>

            {/* Watch Video */}
            <div className="mt-8 flex items-center gap-4">
              <button
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black transition-all hover:bg-black hover:text-white"
                aria-label="Watch Video"
              >
                <Play size={18} fill="currentColor" />
              </button>
              <div>
                <p className="text-[14px] font-bold uppercase tracking-wide text-black">
                  Watch Video
                </p>
                <p className="text-[13px] text-gray-400">
                  Let&apos;s see our story
                </p>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative lg:flex-1">
            <div className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-sm">
              <Image
                src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=600&h=750&fit=crop"
                alt="Stylish fashion couple"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Brand watermark at bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end overflow-hidden px-4 pb-3">
                <span
                  className="text-[1.5rem] font-light tracking-[8px] text-white/40"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                >
                  X T R A F A S H I O N
                </span>
              </div>
            </div>
            {/* Red accent */}
            <div
              className="absolute -bottom-3 right-0 h-24 w-2"
              style={{ background: "#e6193c" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
