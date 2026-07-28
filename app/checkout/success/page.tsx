"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'paid' | 'pending' | 'cod'>('loading');

  useEffect(() => {
    if (sessionId) {
      // This was a PayMongo payment — the webhook will confirm the payment.
      // For UX we optimistically show "confirmed" since PayMongo only redirects on success.
      setPaymentStatus('paid');
    } else if (orderId) {
      // No session_id means this was a COD order
      setPaymentStatus('cod');
    } else {
      setPaymentStatus('pending');
    }
  }, [sessionId, orderId]);

  const statusConfig = {
    loading: {
      icon: <Clock size={64} className="text-gray-400 animate-pulse" />,
      title: "Verifying Payment...",
      description: "Please wait while we confirm your payment.",
      color: "text-gray-400",
    },
    paid: {
      icon: <CheckCircle size={64} className="text-green-500" />,
      title: "Payment Confirmed!",
      description: "Your payment has been successfully processed. Your order is now being prepared.",
      color: "text-green-500",
    },
    cod: {
      icon: <CheckCircle size={64} className="text-green-500" />,
      title: "Order Confirmed!",
      description: "Your order has been placed. Please prepare cash for the delivery.",
      color: "text-green-500",
    },
    pending: {
      icon: <AlertCircle size={64} className="text-orange-500" />,
      title: "Payment Pending",
      description: "We're still waiting for your payment to be confirmed. You'll receive an email once it's processed.",
      color: "text-orange-500",
    },
  };

  const config = statusConfig[paymentStatus];

  return (
    <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-lg w-full text-center">
      <div className="flex justify-center mb-6">
        {config.icon}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-[family-name:var(--font-playfair)]">
        {config.title}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {config.description}
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
