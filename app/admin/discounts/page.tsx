"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Copy } from "lucide-react";

const mockDiscounts = [
  { id: 1, code: "WELCOME20", type: "Percentage", value: "20%", active: true, usageLimit: "150 / 500", expiry: "Dec 31, 2026" },
  { id: 2, code: "BLACKFRIDAY", type: "Percentage", value: "50%", active: false, usageLimit: "Unlimited", expiry: "Nov 30, 2026" },
  { id: 3, code: "FREESHIP", type: "Free Shipping", value: "-", active: true, usageLimit: "84 / 100", expiry: "No Expiry" },
  { id: 4, code: "SUMMER10", type: "Fixed Amount", value: "$10.00", active: false, usageLimit: "100 / 100", expiry: "Aug 31, 2026" },
];

export default function AdminDiscounts() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promo codes and automatic sales.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#e6193c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c41432] transition-colors">
          <Plus size={18} />
          Create Discount
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search discounts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e6193c]">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Discount Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDiscounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 border border-gray-200 bg-gray-100 px-2 py-1 rounded">
                        {discount.code}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600" title="Copy code">
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      discount.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {discount.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{discount.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{discount.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{discount.usageLimit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{discount.expiry}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing 1 to 4 of 4 results</div>
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
