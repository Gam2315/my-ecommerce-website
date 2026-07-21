"use client";

import { ArrowLeft, ArrowRight, MessageSquareQuote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// TODO: Fetch real testimonials from the database
const testimonials: any[] = [];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (testimonials.length === 0) {
    return (
      <section className="py-24 bg-white dark:bg-[#0a0a0a] border-t border-gray-50 dark:border-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <MessageSquareQuote size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-[2.2rem] tracking-tight text-black dark:text-white font-[family-name:var(--font-playfair)] mb-3">
            Customer <span className="font-bold">Reviews</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Our customers' feedback is very important to us. There are no reviews available at the moment, but check back soon!</p>
        </div>
      </section>
    );
  }

  const current = testimonials[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-6 relative">
        {/* Left Arrow */}
        <button 
          onClick={prev}
          className="flex-shrink-0 w-10 h-10 bg-[#111] dark:bg-gray-800 text-white flex items-center justify-center hover:bg-black dark:hover:bg-gray-700 transition-colors z-10 absolute left-4 lg:static"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Center Testimonial */}
        <div className="flex-1 max-w-2xl text-center px-4 md:px-12 py-12 border border-gray-100 dark:border-gray-800 relative min-h-[300px] flex flex-col items-center justify-center">
          <div className="mb-4 inline-block -mt-20">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-[#0a0a0a] shadow-sm mx-auto bg-gray-200 dark:bg-gray-800 relative">
              {current.image ? (
                <Image 
                  src={current.image} 
                  alt={current.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </div>
          
          <h4 className="font-semibold text-[#111] dark:text-white text-lg">
            {current.name} <span className="font-normal text-gray-400 dark:text-gray-500 text-sm ml-1">{current.role}</span>
          </h4>
          
          <p className="mt-6 text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">
            {current.content}
          </p>
        </div>

        {/* Right Arrow */}
        <button 
          onClick={next}
          className="flex-shrink-0 w-10 h-10 bg-[#111] dark:bg-gray-800 text-white flex items-center justify-center hover:bg-black dark:hover:bg-gray-700 transition-colors z-10 absolute right-4 lg:static"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
