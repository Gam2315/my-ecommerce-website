"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Filter, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Failed to fetch orders:", error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', selectedOrder.id);
    if (!error) {
      setSelectedOrder({ ...selectedOrder, status });
      fetchOrders();
    } else {
      alert("Failed to update status: " + error.message);
    }
    setIsUpdating(false);
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 bg-white hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const shortId = order.id.split("-")[0].toUpperCase();
                  const dateStr = new Date(order.created_at).toLocaleDateString();

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#e6193c]" title={order.id}>#{shortId}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dateStr}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{order.payment_method}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₱{Number(order.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium text-gray-900">No orders found</p>
                      <p className="text-sm mt-1">When customers place orders, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-[#e6193c] bg-[#e6193c] rounded text-sm text-white">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Customer Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer_email}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {selectedOrder.payment_method}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Order Items</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-medium text-gray-900 leading-tight mb-1">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size && <span className="mr-2">Size: <strong className="text-gray-700">{item.size}</strong></span>}
                          Qty: <strong className="text-gray-700">{item.quantity}</strong>
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-[#e6193c]">₱{Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between shrink-0 rounded-b-xl gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Update Status:</label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isUpdating || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
