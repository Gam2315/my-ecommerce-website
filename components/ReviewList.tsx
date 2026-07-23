import React from "react";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  rating: number;
  review_text?: string;
  created_at?: string;
  user_id: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const reviewsWithText = reviews.filter((r) => r.review_text && r.review_text.trim().length > 0);

  if (reviewsWithText.length === 0) {
    return (
      <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] mb-6 text-gray-900 dark:text-gray-100">
          Customer Reviews
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No written reviews yet. Be the first to share your thoughts!
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
        {reviewsWithText.map((review, index) => (
          <div key={index} className="border-b border-gray-50 dark:border-gray-800/50 pb-6 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  {/* Mock avatar initial */}
                  V
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">Verified Customer</span>
                  {review.created_at && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-700"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
              {review.review_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
