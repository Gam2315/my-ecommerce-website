"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

const mockProducts = [
  { id: 1, name: "Classic White Tee", category: "Men's Clothing", price: "$29.99", stock: 124, status: "Active", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=100&q=80" },
  { id: 2, name: "Summer Floral Dress", category: "Women's Clothing", price: "$79.50", stock: 15, status: "Low Stock", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=100&q=80" },
  { id: 3, name: "Denim Jacket", category: "Unisex", price: "$110.00", stock: 0, status: "Out of Stock", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=100&q=80" },
  { id: 4, name: "Leather Sneakers", category: "Shoes", price: "$145.00", stock: 45, status: "Active", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=100&q=80" },
];

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog, inventory, and pricing.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#e6193c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c41432] transition-colors">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e6193c]">
              <option>All Categories</option>
              <option>Men's Clothing</option>
              <option>Women's Clothing</option>
              <option>Shoes</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e6193c]">
              <option>All Status</option>
              <option>Active</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' :
                      product.status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.stock} in stock</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.price}</td>
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
