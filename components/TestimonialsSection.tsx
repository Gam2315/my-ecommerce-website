"use client";

import { ArrowLeft, ArrowRight, MessageSquareQuote, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  rating: number;
  review_text?: string;
  created_at?: string;
  user_id?: string;
  user_name?: string;
  product_name?: string;
}

interface TestimonialsSectionProps {
  reviews?: Review[];
}

// TODO: Fetch real testimonials from the database for the home page
const defaultTestimonials: any[] = [];

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use provided reviews or default testimonials
  const items = reviews 
    ? reviews.map(r => ({
        name: r.user_name || "Verified Customer",
        role: r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : "Customer",
        content: r.review_text && r.review_text.trim().length > 0 
          ? r.review_text 
          : (r.product_name ? `Rated: ${r.product_name}` : "Left a rating for this product."),
        rating: r.rating,
        initial: (r.user_name || "V").charAt(0).toUpperCase()
      }))
    : defaultTestimonials;

  if (items.length === 0) {
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

  const current = items[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0a0a0a] border-t border-gray-50 dark:border-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center mb-12">
        <h2 className="text-[2.2rem] tracking-tight text-black dark:text-white font-[family-name:var(--font-playfair)] mb-3">
          Customer <span className="font-bold">Reviews</span>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-6 relative">
        {/* Left Arrow */}
        <button 
          onClick={prev}
          className="flex-shrink-0 w-10 h-10 bg-[#111] dark:bg-gray-800 text-white flex items-center justify-center hover:bg-black dark:hover:bg-gray-700 transition-colors z-10 absolute left-4 lg:static rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Center Testimonial */}
        <div className="flex-1 max-w-2xl text-center px-4 md:px-12 py-12 border border-gray-100 dark:border-gray-800 relative min-h-[300px] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl">
          <div className="mb-4 inline-block -mt-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 border-4 border-white dark:border-[#0a0a0a] shadow-sm mx-auto bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
              {current.image ? (
                <Image 
                  src={current.image} 
                  alt={current.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{current.initial || "V"}</span>
              )}
            </div>
          </div>
          
          <h4 className="font-semibold text-[#111] dark:text-white text-lg">
            {current.name} <span className="font-normal text-gray-400 dark:text-gray-500 text-sm ml-2 block sm:inline">{current.role}</span>
          </h4>

          {current.rating && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= current.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-700"
                  }
                />
              ))}
            </div>
          )}
          
          <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base italic">
            "{current.content}"
          </p>
        </div>

        {/* Right Arrow */}
        <button 
          onClick={next}
          className="flex-shrink-0 w-10 h-10 bg-[#111] dark:bg-gray-800 text-white flex items-center justify-center hover:bg-black dark:hover:bg-gray-700 transition-colors z-10 absolute right-4 lg:static rounded-full"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
