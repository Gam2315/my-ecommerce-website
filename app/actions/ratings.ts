"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRating(productId: string, ratingValue: number) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    return { success: false, error: "You must be logged in to rate a product." };
  }

  const userId = userData.user.id;

  // Insert or Update the rating using an upsert operation
  const { error } = await supabase
    .from("product_ratings")
    .upsert(
      { 
        product_id: productId, 
        user_id: userId, 
        rating: ratingValue 
      },
      { onConflict: "product_id,user_id" }
    );

  if (error) {
    console.error("Error submitting rating:", error);
    return { success: false, error: "Failed to submit rating. Please try again later." };
  }

  revalidatePath(`/product/${productId}`);
  return { success: true };
}
