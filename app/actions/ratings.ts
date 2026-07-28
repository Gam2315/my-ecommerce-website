"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRating(productId: string, ratingValue: number, reviewText?: string, photoDataUrl?: string) {
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

  let photoUrl = null;
  if (photoDataUrl && photoDataUrl.startsWith("data:image/")) {
    try {
      const matches = photoDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = contentType.split('/')[1] || 'jpg';
        const fileName = `reviews/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(fileName, buffer, { contentType, upsert: false });
          
        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage.from('products').getPublicUrl(fileName);
          photoUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Storage upload failed, falling back to Data URL:", uploadError.message);
          photoUrl = photoDataUrl;
        }
      } else {
        photoUrl = photoDataUrl;
      }
    } catch (err) {
      console.warn("Error processing image buffer:", err);
      photoUrl = photoDataUrl;
    }
  } else if (photoDataUrl) {
    photoUrl = photoDataUrl;
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
