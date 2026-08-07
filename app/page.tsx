import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BlackFridayDeals from "@/components/BlackFridayDeals";
import BestSellers from "@/components/BestSellers";
import CollectionsSection from "@/components/CollectionsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BrandsSection from "@/components/BrandsSection";
import FloatingElements from "@/components/FloatingElements";
import {
  getCachedProducts,
  getCachedActiveDiscounts,
  getCachedAllRatings,
  getCachedOrdersForBestsellers,
} from "@/lib/cachedData";
import { enrichRatingsWithUserNames } from "@/lib/userProfiles";

// ISR: Revalidate every 60 seconds instead of on every request
export const revalidate = 60;

export default async function Home() {
  // Parallelize all independent cached queries
  const [allDiscounts, allRatings, allProducts, allOrders] = await Promise.all([
    getCachedActiveDiscounts(),
    getCachedAllRatings(),
    getCachedProducts(),
    getCachedOrdersForBestsellers(),
  ]);

  const activeDiscount = allDiscounts.length > 0 ? allDiscounts[0] : null;

  // Enrich ratings with cached user names (no more listUsers() per render)
  const enrichedRatings = await enrichRatingsWithUserNames(allRatings, allProducts);

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
