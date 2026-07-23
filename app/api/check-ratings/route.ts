import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: adminData, error: adminError } = await supabaseAdmin.from("product_ratings").select("*");
    
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: anonData, error: anonError } = await supabaseAnon.from("product_ratings").select("*");
    
    return NextResponse.json({
      admin: { data: adminData, error: adminError },
      anon: { data: anonData, error: anonError }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
