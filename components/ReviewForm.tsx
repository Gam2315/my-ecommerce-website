"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitRating } from "@/app/actions/ratings";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitRating(productId, rating, reviewText);
      if (result.success) {
        toast.success("Thank you for your review!");
        setRating(0);
        setReviewText("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to submit review.");
      }
    });
  };

  const currentDisplayRating = hoveredStar > 0 ? hoveredStar : rating;

  return (
    <div className="mt-4 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Leave a Review</h4>
      
      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isPending}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              size={20}
              className={`transition-colors duration-200 ${
                star <= currentDisplayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Write your review here... (optional)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        disabled={isPending}
        className="w-full min-h-[80px] p-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-y mb-3"
      />
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending || rating === 0}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold uppercase tracking-wider rounded disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
