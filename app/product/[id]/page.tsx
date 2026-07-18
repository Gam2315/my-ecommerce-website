import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AddToCartSection from "@/components/AddToCartSection";
import { ChevronLeft } from "lucide-react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center flex-col gap-4">
          <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-500">The product you are looking for does not exist.</p>
          <Link href="/" className="mt-4 px-6 py-2 bg-black text-white text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors">
            Return Home
          </Link>
        </div>
      </>
    );
  }

  // Fetch active discounts to see if this product is on sale
  const { data: activeDiscounts } = await supabase
    .from("discounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  let applicableDiscount = null;
  if (activeDiscounts && activeDiscounts.length > 0) {
    applicableDiscount = activeDiscounts.find(d => 
      d.applies_to === 'all' || (d.product_ids && d.product_ids.includes(product.id))
    );
  }

  let originalStr = product.price?.toString().replace(/[^0-9.]/g, '');
  let originalNum = parseFloat(originalStr);
  let finalPriceNumber = isNaN(originalNum) ? 0 : originalNum;
  let discountedPriceStr = null;
  let badgeStr = null;

  if (applicableDiscount && !isNaN(originalNum)) {
    if (applicableDiscount.type === 'Percentage') {
      finalPriceNumber = originalNum * (1 - applicableDiscount.value / 100);
      badgeStr = `${applicableDiscount.value}% OFF`;
    } else {
      finalPriceNumber = originalNum - applicableDiscount.value;
      badgeStr = `₱${applicableDiscount.value} OFF`;
    }
    finalPriceNumber = Math.max(0, finalPriceNumber);
    discountedPriceStr = `₱${finalPriceNumber.toFixed(2)}`;
  }

  const categorySlug = product.category === "Women's Clothing" ? "women" : 
                       product.category === "Men's Clothing" ? "men" : 
                       product.category === "Kids' Clothing" ? "kids" : 
                       product.category === "Shoes" ? "shoes" : 
                       product.category === "Accessories" ? "accessories" : 
                       product.category === "Perfume" ? "perfumes" : "";

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen pt-10 pb-24">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
          
          <Link href={`/category/${categorySlug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8 font-medium">
            <ChevronLeft size={16} />
            Back to {product.category}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Column */}
            <div className="relative aspect-[3/4] w-full bg-[#f8f8f8] rounded-md overflow-hidden">
              {badgeStr && (
                <div className="absolute top-4 left-4 z-10 bg-[#e6193c] text-white text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-sm">
                  {badgeStr}
                </div>
              )}
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="flex flex-col pt-4">
              <h1 className="text-3xl md:text-4xl font-bold text-black font-[family-name:var(--font-playfair)] tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-end gap-3">
                {discountedPriceStr ? (
                  <>
                    <span className="text-2xl font-bold text-[#e6193c]">{discountedPriceStr}</span>
                    <span className="text-lg text-gray-400 line-through mb-0.5">
                      {product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-black">
                    {product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}
                  </span>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  Elevate your style with this premium {product.category.toLowerCase()} piece. Designed with meticulous attention to detail and crafted from high-quality materials for ultimate comfort and durability.
                </p>
              </div>

              {/* Client Component for stateful actions (Size & Add to Cart) */}
              <AddToCartSection 
                product={product} 
                discountedPriceStr={discountedPriceStr}
                finalPriceNumber={finalPriceNumber}
              />

              <div className="mt-12 space-y-4">
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Delivery</span>
                  <span className="text-sm text-gray-500">2-4 Business Days</span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Returns</span>
                  <span className="text-sm text-gray-500">Free within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
