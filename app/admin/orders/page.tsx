"use client";

import { useState } from "react";
import { Search, Eye, Filter } from "lucide-react";

const mockOrders = [
  { id: "#ORD-001", customer: "John Doe", date: "Oct 24, 2026", total: "$120.00", items: 3, status: "Completed" },
  { id: "#ORD-002", customer: "Jane Smith", date: "Oct 24, 2026", total: "$45.50", items: 1, status: "Processing" },
  { id: "#ORD-003", customer: "Bob Johnson", date: "Oct 23, 2026", total: "$299.99", items: 4, status: "Pending" },
  { id: "#ORD-004", customer: "Alice Brown", date: "Oct 22, 2026", total: "$85.00", items: 2, status: "Completed" },
  { id: "#ORD-005", customer: "Charlie Davis", date: "Oct 20, 2026", total: "$12.50", items: 1, status: "Cancelled" },
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");

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
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#e6193c]">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing 1 to 5 of 5 results</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-[#e6193c] bg-[#e6193c] rounded text-sm text-white">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
