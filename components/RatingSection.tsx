"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitRating } from "@/app/actions/ratings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RatingSectionProps {
  productId: string;
  initialAverage: number;
  totalReviews: number;
  userRating: number | null;
  isLoggedIn: boolean;
}

export default function RatingSection({
  productId,
  initialAverage,
  totalReviews,
  userRating,
  isLoggedIn,
}: RatingSectionProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Optimistic UI update
  const [optimisticUserRating, setOptimisticUserRating] = useState<number | null>(userRating);

  const handleRate = (rating: number) => {
    if (!isLoggedIn) {
      toast.error("Please log in to rate this product.");
      router.push("/login");
      return;
    }

    setOptimisticUserRating(rating);
    startTransition(async () => {
      const result = await submitRating(productId, rating);
      if (result.success) {
        toast.success("Thank you for your rating!");
      } else {
        toast.error(result.error || "Failed to submit rating.");
        setOptimisticUserRating(userRating); // Revert on failure
      }
    });
  };

  const currentDisplayRating = hoveredStar > 0 ? hoveredStar : optimisticUserRating;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer Rating</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={isPending}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Star
                  size={20}
                  className={`transition-colors duration-200 ${
                    currentDisplayRating && star <= currentDisplayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-2">
            {initialAverage.toFixed(1)} <span className="text-gray-400 dark:text-gray-500 font-normal">/ 5</span>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
        {optimisticUserRating && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">You rated this {optimisticUserRating} stars</p>
        )}
      </div>
    </div>
  );
}
