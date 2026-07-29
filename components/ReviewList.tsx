"use client";

import React from "react";
import { Star, BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  rating: number;
  review_text?: string;
  photo_url?: string;
  created_at?: string;
  user_id: string;
  user_name?: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const displayableReviews = reviews.filter((r) => 
    (r.review_text && r.review_text.trim().length > 0) || r.photo_url
  );

  if (displayableReviews.length === 0) {
    return (
      <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] mb-6 text-gray-900 dark:text-gray-100">
          Customer Reviews
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No reviews yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
      <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] mb-6 text-gray-900 dark:text-gray-100">
        Customer Reviews
      </h3>
      <div className="space-y-6">
        {displayableReviews.map((review, index) => {
          const displayName = review.user_name || "Anonymous";
          const initial = displayName.charAt(0).toUpperCase();

          return (
            <div key={index} className="border-b border-gray-50 dark:border-gray-800/50 pb-6 last:border-0 last:pb-0">
              {/* Star rating row */}
              <div className="flex mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-700"
                    }
                  />
                ))}
              </div>

              {/* User info row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {displayName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      <BadgeCheck size={12} className="text-green-500" />
                      Verified
                    </span>
                  </div>
                  {review.created_at && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>

              {/* Review text */}
              {review.review_text && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {review.review_text}
                </p>
              )}

              {/* Review photo */}
              {review.photo_url && (
                <div className="mt-2 relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={review.photo_url}
                    alt="Customer review photo"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => window.open(review.photo_url, '_blank')}
                    title="Click to view full image"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
