"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Package, User, CheckCircle, XCircle, Clock, Truck, Star } from "lucide-react";
import Image from "next/image";
import ReviewForm from "@/components/ReviewForm";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push("/login");
        return;
      }
      
      setUser(user);
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setAddress(user.user_metadata?.address || "");

      // Fetch user's orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (!orderError && orderData) {
        setOrders(orderData);
      }
      setLoading(false);
    };

    fetchUserAndData();
  }, [router, supabase]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .eq("user_id", user.id); // Extra safety check
      
    if (error) {
      alert("Failed to update order: " + error.message);
      // Revert if error
      const { data } = await supabase.from("orders").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
      if (data) setOrders(data);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone,
        address: address,
      }
    });

    if (error) {
      setProfileMessage({ type: "error", text: error.message });
    } else {
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    }
    setSavingProfile(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-orange-500" />;
      case 'Processing': return <Package size={16} className="text-blue-500" />;
      case 'Shipped': return <Truck size={16} className="text-purple-500" />;
      case 'Delivered': 
      case 'Completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-[family-name:var(--font-playfair)]">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-gray-50 text-[#e6193c] border-l-2 border-[#e6193c]' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <Package size={18} />
                My Orders
              </button>
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-50 text-[#e6193c] border-l-2 border-[#e6193c]' : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'}`}
              >
                <User size={18} />
                Profile Settings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-playfair)]">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No orders yet</p>
                    <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const isPending = order.status === "Pending";
                    const isShipped = order.status === "Shipped";
                    
                    return (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                            <p className="text-sm font-medium text-gray-900">₱{Number(order.total_amount).toFixed(2)}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order #</p>
                            <p className="text-sm font-medium text-gray-900">{order.id.split('-')[0].toUpperCase()}</p>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="font-semibold text-gray-900">{order.status}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              {isPending && (
                                <button 
                                  onClick={() => {
                                    if(confirm("Are you sure you want to cancel this order?")) {
                                      handleUpdateOrderStatus(order.id, "Cancelled")
                                    }
                                  }}
                                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  Cancel Order
                                </button>
                              )}
                              {isShipped && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                >
                                  Order Received
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {order.items?.map((item: any, idx: number) => {
                              const itemKey = `${order.id}-${item.id || idx}`;
                              const isReviewing = reviewingItemId === itemKey;
                              
                              return (
                                <div key={idx} className="flex flex-col gap-3">
                                  <div className="flex gap-4 items-center">
                                    <div className="w-16 h-20 relative bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-200">
                                      {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900 leading-tight mb-1">{item.name}</h4>
                                      <p className="text-xs text-gray-500 mb-2">
                                        {item.size && <span className="mr-2">Size: {item.size}</span>}
                                        Qty: {item.quantity}
                                      </p>
                                      
                                      {order.status === "Delivered" || order.status === "Completed" ? (
                                        <button
                                          onClick={() => setReviewingItemId(isReviewing ? null : itemKey)}
                                          className="text-xs font-medium text-[#e6193c] hover:text-[#c41432] flex items-center gap-1 transition-colors"
                                        >
                                          <Star size={12} />
                                          {isReviewing ? "Cancel Review" : "Leave a Review"}
                                        </button>
                                      ) : null}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ₱{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                  
                                  {isReviewing && (
                                    <div className="ml-[80px]">
                                      <ReviewForm 
                                        productId={item.id} 
                                        onSuccess={() => setReviewingItemId(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-playfair)]">Profile Details</h2>
                
                {profileMessage.text && (
                  <div className={`p-4 rounded-lg text-sm font-medium mb-6 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed here.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 09123456789"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Address</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      placeholder="Street, City, Province, Zip Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none" 
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 bg-black text-white text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
