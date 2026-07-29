import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  
  const supabase = await createClient();
  
  let products = [];
  let error = null;

  if (query) {
    const result = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("id", { ascending: false });
    
    products = result.data || [];
    error = result.error;
  }

  // Fetch Active Discounts
  const { data: activeDiscounts } = await supabase
    .from("discounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Helper to calculate discount
  const getDiscountData = (product: any) => {
    if (!activeDiscounts || activeDiscounts.length === 0) return null;
    
    const applicableDiscount = activeDiscounts.find(d => 
      d.applies_to === 'all' || (d.product_ids && d.product_ids.includes(product.id))
    );

    if (!applicableDiscount) return null;

    let originalStr = product.price?.toString().replace(/[^0-9.]/g, '');
    let original = parseFloat(originalStr);
    if (isNaN(original)) return null;

    let newPrice = original;
    if (applicableDiscount.type === 'Percentage') {
      newPrice = original * (1 - applicableDiscount.value / 100);
    } else {
      newPrice = original - applicableDiscount.value;
    }
    
    return {
      originalPrice: product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`,
      discountedPrice: `₱${Math.max(0, newPrice).toFixed(2)}`,
      badge: applicableDiscount.type === 'Percentage' ? `${applicableDiscount.value}% OFF` : `₱${applicableDiscount.value} OFF`
    };
  };

  return (
    <>
      <Navbar />
      <div className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-20 pb-24 transition-colors">
        <div className="mx-auto max-w-[1340px] px-5 lg:px-8">
          <div className="mb-14 text-center">
            <h1 className="text-[2.8rem] leading-[1.15] tracking-tight text-black dark:text-white font-[family-name:var(--font-playfair)] font-bold">
              Search Results
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mt-3 text-[15px] max-w-lg mx-auto">
              {query ? `Showing results for "${query}"` : "Enter a search term to find products."}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium">
              Failed to search products: {error.message}
            </div>
          )}

          {!error && query && (!products || products.length === 0) ? (
            <div className="py-24 text-center border-t border-gray-100 dark:border-gray-800">
              <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">No products found matching your search.</p>
              <Link href="/" className="inline-block mt-6 px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold tracking-widest uppercase hover:bg-[#e6193c] transition-colors rounded-sm">
                Return Home
              </Link>
            </div>
          ) : null}

          {products && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product: any) => {
                const discountData = getDiscountData(product);

                return (
                  <div key={product.id} className="group">
                    <Link href={`/product/${product.id}`} className="block">
                      {/* Card */}
                      <div className="product-card relative aspect-[3/4] w-full overflow-hidden bg-[#f8f8f8] dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800">
                        {/* Sale/Status Badges */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                          {discountData && (
                            <span className="bg-[#e6193c] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                              {discountData.badge}
                            </span>
                          )}
                          {product.status === "Low Stock" && (
                            <span className="bg-[#f97316] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                              Low Stock
                            </span>
                          )}
                          {product.status === "Out of Stock" && (
                            <span className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 font-medium">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="mt-4 text-center">
                        <h3 className="text-[15px] font-semibold text-black dark:text-white font-[family-name:var(--font-playfair)]">
                          {product.name}
                        </h3>
                        {discountData ? (
                          <div className="mt-1 flex items-center justify-center gap-2">
                            <span className="text-[14px] text-gray-400 dark:text-gray-500 line-through">
                              {discountData.originalPrice}
                            </span>
                            <span className="text-[14px] font-bold text-[#e6193c]">
                              {discountData.discountedPrice}
                            </span>
                          </div>
                        ) : (
                          <p className="mt-1 text-[14px] font-bold text-black dark:text-white">
                            {product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
