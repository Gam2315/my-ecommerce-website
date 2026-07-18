"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, Check, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function AdminDiscounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);

  // Form State
  const [appliesTo, setAppliesTo] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
    if (error) {
      console.warn("Error fetching discounts. Did you create the table?", error.message);
    } else {
      setDiscounts(data || []);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("id, name, image, price").order("id", { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
  };

  const handleAddDiscount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const value = parseFloat(formData.get("value") as string);
    const expiryStr = formData.get("expiry") as string;
    const expiry = expiryStr ? new Date(expiryStr).toISOString() : null;

    if (!name || isNaN(value)) {
      setError("Please fill out the required fields correctly.");
      setSubmitting(false);
      return;
    }

    if (appliesTo === "specific" && selectedProductIds.length === 0) {
      setError("Please select at least one product.");
      setSubmitting(false);
      return;
    }

    const newDiscount = {
      name,
      type,
      value,
      applies_to: appliesTo,
      product_ids: appliesTo === "all" ? [] : selectedProductIds,
      active: true,
      expiry_date: expiry,
    };

    const { error } = await supabase.from("discounts").insert([newDiscount]);
    
    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      setIsAddModalOpen(false);
      setSubmitting(false);
      // Reset form state
      setAppliesTo("all");
      setSelectedProductIds([]);
      fetchDiscounts();
    }
  };

  const confirmDeleteDiscount = (id: string) => {
    setDiscountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteDiscount = async () => {
    if (!discountToDelete) return;
    const { error } = await supabase.from("discounts").delete().eq("id", discountToDelete);
    if (error) {
      alert("Error deleting discount: " + error.message);
    } else {
      fetchDiscounts();
    }
    setIsDeleteModalOpen(false);
    setDiscountToDelete(null);
  };

  const handleToggleStatus = async (discount: any) => {
    const { error } = await supabase
      .from("discounts")
      .update({ active: !discount.active })
      .eq("id", discount.id);
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchDiscounts();
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const filteredDiscounts = discounts.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatic Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Manage store-wide or specific product sales.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#e6193c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c41432] transition-colors"
        >
          <Plus size={18} />
          Create Sale
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search sales..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Sale Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Applies To</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading discounts...
                  </td>
                </tr>
              ) : filteredDiscounts.length > 0 ? (
                filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{discount.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        discount.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {discount.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{discount.type}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {discount.type === 'Percentage' ? `${discount.value}%` : `₱${discount.value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {discount.applies_to === 'all' ? 'All Products' : `${discount.product_ids?.length || 0} Products`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(discount)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" 
                          title={discount.active ? "Deactivate" : "Activate"}
                        >
                          {discount.active ? <XCircle size={16} /> : <Check size={16} />}
                        </button>
                        <button 
                          onClick={() => confirmDeleteDiscount(discount.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium text-gray-900">No active sales found</p>
                      <p className="text-sm mt-1">Create your first sale to get started.</p>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 flex items-center gap-2 bg-[#e6193c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c41432] transition-colors"
                      >
                        <Plus size={18} />
                        Create Sale
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Discount Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Create New Sale</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <form id="add-discount-form" onSubmit={handleAddDiscount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Name</label>
                  <input 
                    name="name" 
                    required 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c]"
                    placeholder="e.g. Summer Clearance"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                    <select 
                      name="type" 
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c]"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (₱)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input 
                      name="value" 
                      required 
                      type="number" 
                      min="1"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c]"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                {/* Applies To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applies To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={appliesTo === "all"}
                        onChange={() => setAppliesTo("all")}
                        className="accent-[#e6193c]"
                      />
                      <span className="text-sm">Entire Store</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={appliesTo === "specific"}
                        onChange={() => setAppliesTo("specific")}
                        className="accent-[#e6193c]"
                      />
                      <span className="text-sm">Specific Products</span>
                    </label>
                  </div>
                </div>

                {/* Product Selection List */}
                {appliesTo === "specific" && (
                  <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                    {products.map(product => (
                      <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="accent-[#e6193c]"
                        />
                        <div className="w-8 h-8 relative rounded bg-gray-100 overflow-hidden shrink-0">
                          {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}</p>
                        </div>
                      </label>
                    ))}
                    {products.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No products available.
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input 
                    name="expiry" 
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e6193c]"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-discount-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#e6193c] hover:bg-[#c41432] rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Create Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm my-8 relative flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Sale</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this sale? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDiscountToDelete(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeDeleteDiscount}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors w-full sm:w-auto"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
