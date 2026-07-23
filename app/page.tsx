import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BlackFridayDeals from "@/components/BlackFridayDeals";
import BestSellers from "@/components/BestSellers";
import CollectionsSection from "@/components/CollectionsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BrandsSection from "@/components/BrandsSection";
import FloatingElements from "@/components/FloatingElements";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  
  const { data: activeDiscounts } = await supabase
    .from("discounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  const activeDiscount = activeDiscounts && activeDiscounts.length > 0 ? activeDiscounts[0] : null;

  const { data: allRatings } = await supabase
    .from("product_ratings")
    .select("*")
    .order("created_at", { ascending: false });

  let enrichedRatings = allRatings || [];

  if (allRatings && allRatings.length > 0) {
    const { createClient: createAdmin } = require('@supabase/supabase-js');
    const adminSupabase = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch users to get their names
    const { data: { users } } = await adminSupabase.auth.admin.listUsers();
    
    // Fetch products to get product names
    const { data: products } = await supabase.from("products").select("id, name");
    
    enrichedRatings = allRatings.map(rating => {
      const user = users.find((u: any) => u.id === rating.user_id);
      const product = products?.find((p: any) => p.id.toString() === rating.product_id?.toString());
      
      return {
        ...rating,
        user_name: user?.user_metadata?.full_name || "Verified Customer",
        product_name: product?.name
      };
    });
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection activeDiscount={activeDiscount} />
        <BlackFridayDeals activeDiscount={activeDiscount} />
        <BestSellers />
        <CollectionsSection />
        <TestimonialsSection reviews={enrichedRatings} />
        <BrandsSection />
      </main>
      <FloatingElements />
    </>
  );
}
