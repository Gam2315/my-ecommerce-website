"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartSection({ product, discountedPriceStr, finalPriceNumber }: { product: any, discountedPriceStr: string | null, finalPriceNumber: number }) {
  const { addToCart, isGuest } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const hasSizes = product.sizes && Object.keys(product.sizes).length > 0;
  
  // Filter out sizes with 0 stock
  const availableSizes = hasSizes 
    ? Object.entries(product.sizes).filter(([_, stock]) => (stock as number) > 0).map(([size]) => size)
    : [];

  const handleAddToCart = () => {
    if (isGuest) {
      router.push("/login");
      return;
    }

    if (hasSizes && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    addToCart({
      id: `${product.id}${selectedSize ? `_${selectedSize}` : ''}`,
      productId: product.id,
      name: product.name,
      size: selectedSize || undefined,
      price: finalPriceNumber,
      image: product.image,
      quantity: 1
    });
  };

  const isOutOfStock = product.status === "Out of Stock" || (hasSizes && availableSizes.length === 0);

  return (
    <div className="mt-8">
      {hasSizes && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Size</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.keys(product.sizes).map((size) => {
              const isAvailable = (product.sizes[size] as number) > 0;
              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-sm font-medium rounded-md border flex items-center justify-center transition-colors
                    ${!isAvailable ? 'bg-gray-50 border-gray-100 text-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-600 cursor-not-allowed' : 
                      selectedSize === size ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-gray-200 text-gray-900 hover:border-black dark:border-gray-700 dark:text-gray-200 dark:hover:border-white'}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!isGuest && isOutOfStock}
        className={`w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-colors
          ${(!isGuest && isOutOfStock) ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' : 'bg-[#e6193c] text-white hover:bg-[#c41432]'}
        `}
      >
        {isGuest ? "Log in to Add to Cart" : (isOutOfStock ? "Out of Stock" : "Add to Cart")}
      </button>
    </div>
  );
}
