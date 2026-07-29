"use client";

import { useState, useEffect, useTransition } from "react";
import { Star, Upload, X, CheckCircle } from "lucide-react";
import { submitRating } from "@/app/actions/ratings";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [checkingRated, setCheckingRated] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    async function checkExistingRating() {
      setCheckingRated(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("product_ratings")
          .select("id")
          .eq("product_id", productId)
          .eq("user_id", user.id)
          .single();
        if (data) {
          setHasRated(true);
        }
      }
      setCheckingRated(false);
    }
    checkExistingRating();
  }, [productId, supabase]);

  // Cleanup object URL on unmount or when photo changes
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size exceeds the 5MB limit. Please choose a smaller file.");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      e.target.value = "";
      return;
    }

    // Revoke previous preview URL if any
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
  };

  const handleSubmit = () => {
    if (hasRated) {
      toast.error("You have already rated this product.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      let uploadedPhotoUrl: string | undefined = undefined;

      // Upload photo via API route if a file was selected
      if (photoFile) {
        try {
          const formData = new FormData();
          formData.append("photo", photoFile);

          const uploadRes = await fetch("/api/upload-review-photo", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            toast.error(uploadData.error || "Failed to upload photo.");
            return;
          }

          uploadedPhotoUrl = uploadData.url;
        } catch {
          toast.error("Failed to upload photo. Please try again.");
          return;
        }
      }

      const result = await submitRating(productId, rating, reviewText, uploadedPhotoUrl);
      if (result.success) {
        toast.success("Thank you for your review!");
        setRating(0);
        setReviewText("");
        clearPhoto();
        setHasRated(true);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to submit review.");
      }
    });
  };

  const currentDisplayRating = hoveredStar > 0 ? hoveredStar : rating;

  if (checkingRated) {
    return (
      <div className="mt-4 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500">
        Checking review status...
      </div>
    );
  }

  if (hasRated) {
    return (
      <div className="mt-4 p-4 border border-green-200 dark:border-green-900/50 rounded-lg bg-green-50/50 dark:bg-green-950/20 flex items-center gap-3 text-sm text-green-800 dark:text-green-300 font-medium">
        <CheckCircle size={18} className="text-green-600 dark:text-green-400 shrink-0" />
        <span>You have already rated this product.</span>
      </div>
    );
  }

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

      {/* Photo Upload Section */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Add Photo (Max 5MB, Optional)
        </label>
        
        {photoPreviewUrl ? (
          <div className="relative inline-block w-20 h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreviewUrl} alt="Review upload preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              disabled={isPending}
              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
              title="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors text-xs text-gray-500 dark:text-gray-400">
            <Upload size={14} className="text-gray-400 dark:text-gray-500" />
            <span>Click to upload a photo (PNG, JPG up to 5MB)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isPending}
              className="hidden"
            />
          </label>
        )}
      </div>
      
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
