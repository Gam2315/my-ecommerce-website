"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

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
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      customer_name: formData.get("fullName") as string,
      customer_email: formData.get("email") as string,
      customer_phone: formData.get("phone") as string,
      shipping_address: formData.get("address") as string,
      payment_method: paymentMethod,
      total_amount: cartTotal,
      items: items,
      status: 'Pending',
      user_id: userId
    };

    const { data, error: insertError } = await supabase
      .from("orders")
      .insert([orderData])
      .select();

    if (insertError) {
      console.error(insertError);
      setError("Failed to place order. Did you create the orders table in Supabase?");
      setIsSubmitting(false);
      return;
    }

    // Deduct stock for each item
    for (const item of items) {
      const { data: product } = await supabase.from('products').select('*').eq('id', item.productId).single();
      
      if (product) {
        if (item.size && product.sizes) {
          // Deduct from specific size
          const newSizes = { ...product.sizes };
          if (typeof newSizes[item.size] === 'number') {
            newSizes[item.size] = Math.max(0, newSizes[item.size] - item.quantity);
          }
          await supabase.from('products').update({ sizes: newSizes }).eq('id', product.id);
        } else {
          // Deduct from general stock
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          const newStatus = newStock === 0 ? "Out of Stock" : product.status;
          await supabase.from('products').update({ stock: newStock, status: newStatus }).eq('id', product.id);
        }
      }
    }

    // Success!
    clearCart();
    router.push(`/checkout/success?id=${data[0].id}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/" className="px-6 py-3 bg-black text-white text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gray-900 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-[1200px] mx-auto px-5 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="flex h-7 w-7 items-center justify-center border-2 border-black text-[11px] font-black leading-none rounded-sm">
              X
            </span>
            <span className="text-[15px] font-extrabold tracking-wide text-black hidden sm:inline">
              TRAFASHION<span className="text-black">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Lock size={16} />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 mt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 font-medium">
          <ChevronLeft size={16} />
          Back to Shopping
        </Link>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-8">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Contact & Shipping Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-playfair)]">Shipping Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input name="fullName" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input name="email" required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address</label>
                  <textarea name="address" required rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="Street, City, Province, Zip Code" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-playfair)]">Payment Method</h2>
              
              <div className="space-y-3">
                {/* GCash */}
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'GCash' ? 'border-[#007DFE] bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="GCash"
                      checked={paymentMethod === 'GCash'}
                      onChange={() => setPaymentMethod('GCash')}
                      className="w-4 h-4 accent-[#007DFE]"
                    />
                    <span className="font-semibold text-gray-900">GCash</span>
                  </div>
                  {paymentMethod === 'GCash' && (
                    <div className="mt-4 pl-7">
                      <input type="tel" placeholder="GCash Mobile Number" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#007DFE] text-sm" />
                    </div>
                  )}
                </label>

                {/* VISA */}
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'Visa' ? 'border-[#1A1F71] bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="Visa"
                      checked={paymentMethod === 'Visa'}
                      onChange={() => setPaymentMethod('Visa')}
                      className="w-4 h-4 accent-[#1A1F71]"
                    />
                    <span className="font-semibold text-gray-900">Credit/Debit Card (Visa)</span>
                  </div>
                  {paymentMethod === 'Visa' && (
                    <div className="mt-4 pl-7 space-y-3">
                      <input type="text" placeholder="Card Number" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A1F71] text-sm" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A1F71] text-sm" />
                        <input type="text" placeholder="CVC" className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A1F71] text-sm" />
                      </div>
                    </div>
                  )}
                </label>

                {/* COD */}
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="mt-3 pl-7 text-sm text-gray-500">
                      Pay with cash upon delivery.
                    </div>
                  )}
                </label>
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-playfair)]">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 relative bg-gray-100 rounded overflow-hidden shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h4>
                      {item.size && <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-[#e6193c]">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#e6193c] hover:bg-[#c41432] text-white text-sm font-bold tracking-widest uppercase rounded-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
