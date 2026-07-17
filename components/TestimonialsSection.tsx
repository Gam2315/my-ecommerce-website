"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-6 relative">
        {/* Left portions of adjacent testimonials blurred out (implied by image, but let's just do a clean central focus) */}
        <div className="hidden lg:block w-1/4 opacity-10 pointer-events-none select-none">
          <p className="text-sm">e! The clothes are expectations. Everything confident and stylish every</p>
        </div>

        {/* Left Arrow */}
        <button className="flex-shrink-0 w-10 h-10 bg-[#111] text-white flex items-center justify-center hover:bg-black transition-colors z-10 absolute left-4 lg:static">
          <ArrowLeft size={20} />
        </button>

        {/* Center Testimonial */}
        <div className="flex-1 max-w-2xl text-center px-4 md:px-12 py-12 border border-gray-100 relative">
          <div className="mb-4 inline-block -mt-20">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-sm mx-auto bg-gray-200 relative">
              {/* Fallback to external Unsplash image since we couldn't copy the local one */}
              <Image 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" 
                alt="David Jr."
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          <h4 className="font-semibold text-[#111] text-lg">
            David Jr. <span className="font-normal text-gray-400 text-sm ml-1">Businessman</span>
          </h4>
          
          <p className="mt-6 text-gray-500 leading-relaxed text-sm md:text-base">
            Shopping at Xtra Fashion has been such a great experience. The website is easy to navigate, the collections are always fresh, and their sizing is spot on. I had a small issue with one item, but their customer support team was amazing and resolved it right away. Truly reliable and fashion-forward!
          </p>
        </div>

        {/* Right Arrow */}
        <button className="flex-shrink-0 w-10 h-10 bg-[#111] text-white flex items-center justify-center hover:bg-black transition-colors z-10 absolute right-4 lg:static">
          <ArrowRight size={20} />
        </button>

        {/* Right portions of adjacent testimonials blurred out */}
        <div className="hidden lg:block w-1/4 opacity-10 pointer-events-none select-none text-right">
          <p className="text-sm">I can't say enough statement pieces, I packaging is cute, feels like they really</p>
        </div>
      </div>
    </section>
  );
}
