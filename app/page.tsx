import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BlackFridayDeals from "@/components/BlackFridayDeals";
import BestSellers from "@/components/BestSellers";
import CollectionsSection from "@/components/CollectionsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BrandsSection from "@/components/BrandsSection";
import FloatingElements from "@/components/FloatingElements";
import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";

// ISR: Revalidate every 60 seconds instead of on every request
export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  // Parallelize all independent queries
  const [discountsResult, ratingsResult, productsResult, ordersResult] = await Promise.all([
    supabase
      .from("discounts")
      .select("id, name, type, value, active, expiry_date, applies_to, product_ids")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("product_ratings")
      .select("rating, review_text, created_at, user_id, product_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*"),
    supabase
      .from("orders")
      .select("items")
      .in("status", ["Delivered", "Completed", "Shipped", "Processing", "Pending"]),
  ]);

  const activeDiscount =
    discountsResult.data && discountsResult.data.length > 0
      ? discountsResult.data[0]
      : null;

  const allRatings = ratingsResult.data || [];
  const allProducts = productsResult.data || [];
  const allOrders = ordersResult.data || [];

  if (productsResult.error) console.error("Products fetch error:", productsResult.error);
  if (ordersResult.error) console.error("Orders fetch error:", ordersResult.error);

  // Enrich ratings with user names (only if there are ratings)
  let enrichedRatings = allRatings;

  if (allRatings.length > 0) {
    const adminSupabase = getAdminClient();
    const { data: { users } } = await adminSupabase.auth.admin.listUsers();

    enrichedRatings = allRatings.map((rating) => {
      const user = users.find((u: any) => u.id === rating.user_id);
      const product = allProducts.find(
        (p: any) => p.id.toString() === rating.product_id?.toString()
      );

      return {
        ...rating,
        user_name:
          user?.user_metadata?.full_name || "Verified Customer",
        product_name: product?.name,
      };
    });
  }

  // Calculate best sellers from orders data
  const salesCount: Record<number, number> = {};
  allOrders.forEach((order) => {
    let items = order.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch(e) { items = []; }
    }
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        salesCount[item.productId] =
          (salesCount[item.productId] || 0) + item.quantity;
      });
    }
  });

  const bestSellerProducts = allProducts
    .map((p) => ({ ...p, sales: salesCount[p.id] || 0 }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection activeDiscount={activeDiscount} />
        <BlackFridayDeals activeDiscount={activeDiscount} />
        <BestSellers products={bestSellerProducts} />
        <CollectionsSection />
        <TestimonialsSection reviews={enrichedRatings} />
        <BrandsSection />
      </main>
      <FloatingElements />
    </>
  );
}
