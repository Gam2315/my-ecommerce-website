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

  return (
    <>
      <Navbar />
      <main>
        <HeroSection activeDiscount={activeDiscount} />
        <BlackFridayDeals activeDiscount={activeDiscount} />
        <BestSellers />
        <CollectionsSection />
        <TestimonialsSection />
        <BrandsSection />
      </main>
      <FloatingElements />
    </>
  );
}
