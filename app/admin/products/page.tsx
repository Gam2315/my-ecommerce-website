"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic form state
  const [selectedCategory, setSelectedCategory] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isAddModalOpen && !isEditModalOpen) {
      setSelectedCategory("");
      setEditingProduct(null);
      setError(null);
    }
  }, [isAddModalOpen, isEditModalOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) {
      console.warn("Error fetching products. The table might not exist yet:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const confirmDeleteProduct = (id: number) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteProduct = async () => {
    if (productToDelete === null) return;
    
    const { error } = await supabase.from("products").delete().eq("id", productToDelete);
    if (error) {
      alert("Error deleting product: " + error.message);
    } else {
      fetchProducts();
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setSelectedCategory(product.category);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category") as string;
    
    // Image handling
    const imageFile = formData.get("image") as File;
    let imageUrl = isEdit ? editingProduct.image : "";

    // Only process upload if a new file is selected
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 3 * 1024 * 1024) {
        setError("Image file size must be less than 3MB.");
        setSubmitting(false);
        return;
      }
      if (!imageFile.type.startsWith("image/")) {
        setError("Only image files are allowed. Video files are not permitted.");
        setSubmitting(false);
        return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setError("Failed to upload image. Details: " + uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    } else if (!isEdit) {
      setError("Please attach an image.");
      setSubmitting(false);
      return;
    }

    let totalStock = 0;
    let sizesObj: Record<string, number> = {};

    if (["Men's Clothing", "Women's Clothing", "Kids' Clothing"].includes(category)) {
      const s = parseInt(formData.get("stock_S") as string) || 0;
      const m = parseInt(formData.get("stock_M") as string) || 0;
      const l = parseInt(formData.get("stock_L") as string) || 0;
      const xl = parseInt(formData.get("stock_XL") as string) || 0;
      sizesObj = { S: s, M: m, L: l, XL: xl };
      totalStock = s + m + l + xl;
    } else if (category === "Shoes") {
      const s7 = parseInt(formData.get("stock_7") as string) || 0;
      const s8 = parseInt(formData.get("stock_8") as string) || 0;
      const s9 = parseInt(formData.get("stock_9") as string) || 0;
      const s10 = parseInt(formData.get("stock_10") as string) || 0;
      const s11 = parseInt(formData.get("stock_11") as string) || 0;
      sizesObj = { "7": s7, "8": s8, "9": s9, "10": s10, "11": s11 };
      totalStock = s7 + s8 + s9 + s10 + s11;
    } else {
      totalStock = parseInt(formData.get("stock") as string) || 0;
    }

    let status = "Active";
    if (totalStock === 0) status = "Out of Stock";
    else if (totalStock <= 5) status = "Low Stock";

    const productData = {
      name: formData.get("name") as string,
      category,
      price: formData.get("price") as string,
      stock: totalStock,
      status,
      image: imageUrl,
      sizes: Object.keys(sizesObj).length > 0 ? sizesObj : null
    };

    if (isEdit) {
      const { data, error } = await supabase.from("products").update(productData).eq("id", editingProduct.id).select();
      if (error) {
        setError(error.message);
        setSubmitting(false);
        return;
      }
      if (!data || data.length === 0) {
        setError("Product not updated. This usually means Row Level Security (RLS) blocked the action. Are you logged in as an admin?");
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert([productData]);
      if (error) {
        setError(error.message);
        setSubmitting(false);
        return;
      }
    }
    
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSubmitting(false);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your catalog, inventory, and pricing.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#e6193c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c41432] transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] focus:ring-1 focus:ring-[#e6193c] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 relative">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        product.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {product.stock} in stock
                      {product.sizes && (
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {Object.entries(product.sizes).map(([size, stock]) => `${size}: ${stock}`).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {product.price?.toString().startsWith('₱') ? product.price : `₱${product.price}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" 
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDeleteProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" 
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditModalOpen ? "Edit Product" : "Add New Product"}</h2>
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}
              <form id="product-form" onSubmit={(e) => handleSaveProduct(e, isEditModalOpen)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input 
                    name="name" 
                    required 
                    type="text" 
                    defaultValue={editingProduct?.name || ""}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    name="category" 
                    required
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    <option value="Men's Clothing">Men's Clothing</option>
                    <option value="Women's Clothing">Women's Clothing</option>
                    <option value="Kids' Clothing">Kids' Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Perfume">Perfume</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                    <input 
                      name="price" 
                      required 
                      type="text" 
                      defaultValue={editingProduct?.price || ""}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  {/* Dynamic Stock Input */}
                  {["Men's Clothing", "Women's Clothing", "Kids' Clothing"].includes(selectedCategory) ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock per Size</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["S", "M", "L", "XL"].map(size => (
                          <div key={size}>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{size}</label>
                            <input name={`stock_${size}`} type="number" min="0" defaultValue={editingProduct?.sizes?.[size] || "0"} className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-[#e6193c] text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedCategory === "Shoes" ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock per Shoe Size</label>
                      <div className="grid grid-cols-5 gap-2">
                        {["7", "8", "9", "10", "11"].map(size => (
                          <div key={size}>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">US {size}</label>
                            <input name={`stock_${size}`} type="number" min="0" defaultValue={editingProduct?.sizes?.[size] || "0"} className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-[#e6193c] text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                      <input 
                        name="stock" 
                        required 
                        type="number" 
                        min="0"
                        defaultValue={editingProduct?.stock || "0"}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Image {isEditModalOpen && <span className="text-gray-400 dark:text-gray-500 font-normal">(Leave blank to keep current image)</span>}
                  </label>
                  <input 
                    name="image" 
                    required={!isEditModalOpen}
                    type="file" 
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#e6193c] bg-white dark:bg-gray-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e6193c]/10 file:text-[#e6193c] hover:file:bg-[#e6193c]/20 text-gray-900 dark:text-white"
                  />
                  {isEditModalOpen && editingProduct?.image && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <div className="w-8 h-8 rounded relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image src={editingProduct.image} alt="Current" fill className="object-cover" />
                      </div>
                      Current image will be kept.
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="product-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#e6193c] hover:bg-[#c41432] rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm my-8 relative flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Product</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <button 
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeDeleteProduct}
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
