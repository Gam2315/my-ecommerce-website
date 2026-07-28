"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock, Wallet, CreditCard, Banknote, Smartphone } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: 'GCash',
    label: 'GCash',
    description: 'Pay with your GCash e-wallet',
    color: '#007DFE',
    icon: Smartphone,
  },
  {
    id: 'GrabPay',
    label: 'GrabPay',
    description: 'Pay with your GrabPay wallet',
    color: '#00B14F',
    icon: Wallet,
  },
  {
    id: 'Maya',
    label: 'Maya',
    description: 'Pay with your Maya (PayMaya) wallet',
    color: '#2DBB54',
    icon: Wallet,
  },
  {
    id: 'Card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard — processed securely via PayMongo',
    color: '#1A1F71',
    icon: CreditCard,
  },
  {
    id: 'COD',
    label: 'Cash on Delivery (COD)',
    description: 'Pay with cash upon delivery',
    color: '#000000',
    icon: Banknote,
  },
];

export default function CheckoutPage() {
  const { items, selectedItems, selectedTotal, removeSelectedFromCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const checkoutItems = selectedItems.length > 0 ? selectedItems : items;
  const checkoutTotal = selectedItems.length > 0 ? selectedTotal : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fetch the current user so we can attach their ID to the order
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
      }
    });
  }, [supabase]);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      setError("Your cart is empty or no items are selected.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("fullName") as string;
    const customerEmail = formData.get("email") as string;
    const customerPhone = formData.get("phone") as string;
    const shippingAddress = formData.get("address") as string;

    const isCOD = paymentMethod === 'COD';

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      total_amount: checkoutTotal,
      items: checkoutItems,
      status: isCOD ? 'Pending' : 'Awaiting Payment',
      user_id: userId,
    };

    // Insert order into Supabase
    const { data, error: insertError } = await supabase
      .from("orders")
      .insert([orderData])
      .select();

    if (insertError) {
      console.error(insertError);
      setError("Failed to place order. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const orderId = data[0].id;

    if (isCOD) {
      // COD: deduct stock immediately and go to success
      for (const item of checkoutItems) {
        const { data: product } = await supabase.from('products').select('*').eq('id', item.productId).single();
        
        if (product) {
          if (item.size && product.sizes) {
            const newSizes = { ...product.sizes };
            if (typeof newSizes[item.size] === 'number') {
              newSizes[item.size] = Math.max(0, newSizes[item.size] - item.quantity);
            }
            await supabase.from('products').update({ sizes: newSizes }).eq('id', product.id);
          } else {
            const newStock = Math.max(0, (product.stock || 0) - item.quantity);
            const newStatus = newStock === 0 ? "Out of Stock" : product.status;
            await supabase.from('products').update({ stock: newStock, status: newStatus }).eq('id', product.id);
          }
        }
      }

      removeSelectedFromCart();
      router.push(`/checkout/success?id=${orderId}`);
    } else {
      // Online payment: create PayMongo checkout session and redirect
      try {
        const response = await fetch('/api/paymongo/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: checkoutItems,
            paymentMethodType: paymentMethod,
            orderId: orderId,
            customer: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to initiate payment');
        }

        // Clear selected items from cart before redirecting
        removeSelectedFromCart();

        // Redirect to PayMongo's hosted checkout page
        window.location.href = result.checkout_url;
      } catch (err: any) {
        console.error('PayMongo checkout error:', err);
        setError(err.message || 'Failed to initiate payment. Please try again.');
        
        // Rollback: delete the order since payment initiation failed
        await supabase.from('orders').delete().eq('id', orderId);
        setIsSubmitting(false);
      }
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 transition-colors">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] mb-2 text-gray-900 dark:text-white">
          {items.length === 0 ? "Your Cart is Empty" : "No Items Selected"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {items.length === 0 
            ? "Looks like you haven't added anything to your cart yet."
            : "Please select at least one item in your cart to proceed with checkout."}
        </p>
        <Link href="/" className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors">
          {items.length === 0 ? "Continue Shopping" : "Back to Shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24 transition-colors">
      {/* Checkout Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-[1200px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="flex h-7 w-7 items-center justify-center border-2 border-black dark:border-white text-[11px] font-black leading-none rounded-sm text-black dark:text-white">
              X
            </span>
            <span className="text-[15px] font-extrabold tracking-wide text-black dark:text-white hidden sm:inline">
              TRAFASHION<span className="text-black dark:text-white">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <Lock size={16} />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 mt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-6 font-medium">
          <ChevronLeft size={16} />
          Back to Shopping
        </Link>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-8">
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Contact & Shipping Info */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-[family-name:var(--font-playfair)]">Shipping Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
                    <input name="fullName" required type="text" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-black dark:focus:border-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-black dark:focus:border-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email Address</label>
                  <input name="email" required type="email" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-black dark:focus:border-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Delivery Address</label>
                  <textarea name="address" required rows={3} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-black dark:focus:border-white resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Street, City, Province, Zip Code" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-[family-name:var(--font-playfair)]">Payment Method</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {paymentMethod === 'COD' 
                  ? 'Pay with cash when your order arrives.' 
                  : 'You will be redirected to complete payment securely via PayMongo.'}
              </p>
              
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  const Icon = method.icon;
                  
                  return (
                    <label 
                      key={method.id}
                      className={`block border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-2 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                      }`}
                      style={isSelected ? { borderColor: method.color, backgroundColor: `${method.color}08` } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="w-4 h-4 accent-current"
                          style={{ accentColor: method.color }}
                        />
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: isSelected ? `${method.color}15` : 'rgb(243 244 246)',
                          }}
                        >
                          <Icon 
                            size={18} 
                            style={{ color: isSelected ? method.color : '#9ca3af' }}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{method.label}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-[family-name:var(--font-playfair)]">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{item.name}</h4>
                      {item.size && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Size: {item.size}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₱{checkoutTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-[#e6193c]">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="font-medium text-gray-900 dark:text-white">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 dark:border-gray-800 pt-3 text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>₱{checkoutTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#e6193c] hover:bg-[#c41432] text-white text-sm font-bold tracking-widest uppercase rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? "Processing..." 
                  : paymentMethod === 'COD' 
                    ? "Place Order" 
                    : `Pay ₱${checkoutTotal.toFixed(2)}`}
              </button>

              {paymentMethod !== 'COD' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 flex items-center justify-center gap-1.5">
                  <Lock size={12} />
                  Secured by PayMongo
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
