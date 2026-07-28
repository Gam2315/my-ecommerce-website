"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-lg w-full text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-[family-name:var(--font-playfair)]">
        Order Confirmed!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Thank you for shopping with XTRAFASHION. Your order has been successfully placed.
      </p>

      {orderId && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
          <p className="font-mono text-gray-900 dark:text-white font-medium">{orderId}</p>
        </div>
      )}

      <Link 
        href="/"
        className="block w-full py-4 bg-black text-white dark:bg-white dark:text-black text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 transition-colors">
      <Suspense fallback={<div className="text-gray-500 dark:text-gray-400">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
