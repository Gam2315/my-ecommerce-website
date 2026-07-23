"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRating(productId: string, ratingValue: number, reviewText?: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    return { success: false, error: "You must be logged in to rate a product." };
  }

  const userId = userData.user.id;

  // Create an admin client to bypass RLS for inserting the rating
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const payload: any = { 
    product_id: productId, 
    user_id: userId, 
    rating: ratingValue 
  };
  
  if (reviewText !== undefined) {
    payload.review_text = reviewText;
  }

  // Check if rating already exists
  const { data: existingRating } = await supabaseAdmin
    .from("product_ratings")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();

  let error;

  if (existingRating) {
    // Update existing rating
    const { error: updateError } = await supabaseAdmin
      .from("product_ratings")
      .update({ rating: ratingValue, review_text: reviewText })
      .eq("id", existingRating.id);
    error = updateError;
  } else {
    // Insert new rating
    const { error: insertError } = await supabaseAdmin
      .from("product_ratings")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    console.error("Error submitting rating:", error);
    return { success: false, error: "Failed to submit rating: " + error.message };
  }

  revalidatePath(`/product/${productId}`);
  revalidatePath(`/`);
  return { success: true };
}
