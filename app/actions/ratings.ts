"use server";

import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitRating(productId: string, ratingValue: number, reviewText?: string, photoUrl?: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    return { success: false, error: "You must be logged in to rate a product." };
  }

  const userId = userData.user.id;

  // Use the shared admin client to bypass RLS
  const supabaseAdmin = getAdminClient();

  // Check if rating already exists
  const { data: existingRating } = await supabaseAdmin
    .from("product_ratings")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();

  if (existingRating) {
    return { success: false, error: "You have already rated this product." };
  }

  const payload: any = { 
    product_id: productId, 
    user_id: userId, 
    rating: ratingValue 
  };
  
  if (reviewText !== undefined && reviewText.trim() !== "") {
    payload.review_text = reviewText;
  }
  if (photoUrl) {
    payload.photo_url = photoUrl;
  }

  // Insert new rating
  const { error: insertError } = await supabaseAdmin
    .from("product_ratings")
    .insert(payload);

  if (insertError) {
    console.error("Error submitting rating:", insertError);
    if (insertError.message && insertError.message.includes("photo_url")) {
      return { 
        success: false, 
        error: 'Failed to save photo: Please add a text column named "photo_url" to the "product_ratings" table in your Supabase database.' 
      };
    }
    return { success: false, error: "Failed to submit rating: " + insertError.message };
  }

  revalidatePath(`/product/${productId}`);
  revalidatePath(`/`);
  return { success: true };
}

