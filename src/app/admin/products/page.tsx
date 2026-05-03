'use client';

import { useEffect, useState } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    sale_price: '',
    product_type: 'carousel' as Product['product_type'],
    items_count: '1',
    stripe_link: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    const productData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      product_type: formData.product_type,
      items_count: parseInt(formData.items_count),
      stripe_link: formData.stripe_link || null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (error) {
        alert('Error updating product: ' + error.message);
      } else {
        setEditingProduct(null);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (error) {
        alert('Error creating product: ' + error.message);
      } else {
        setIsCreating(false);
        resetForm();
        fetchProducts();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      fetchProducts();
    }
  }

  async function toggleActive(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    
    if (!error) {
      fetchProducts();
    }
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      category: product.category,
      price: product.price.toString(),
      sale_price: product.sale_price?.toString() || '',
      product_type: product.product_type,
      items_count: product.items_count.toString(),
      stripe_link: product.stripe_link || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      sale_price: '',
      product_type: 'carousel',
      items_count: '1',
      stripe_link: '',
      is_active: true,
      is_featured: false,
    });
    setEditingProduct(null);
  }

  function cancelEdit() {
    setIsCreating(false);
    setEditingProduct(null);
    resetForm();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C96A2B]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#081F33]">Products</h1>
          <p className="text-[#4B5563]">{products.length} products in catalog</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#081F33] mb-6">
            {editingProduct ? 'Edit Product' : 'New Product'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., Termite Carousel Pack"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., Termites, Roaches, Bundle"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#081F33] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                rows={3}
                placeholder="Brief description of the product..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="97.00"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Sale Price</label>
              <input
                type="number"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="Optional"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Product Type *</label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value as Product['product_type'] })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              >
                <option value="carousel">Carousel</option>
                <option value="reel">Reel</option>
                <option value="bundle">Bundle</option>
                <option value="monthly_plan">Monthly Plan</option>
                <option value="addon">Add-on</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Items Count</label>
              <input
                type="number"
                value={formData.items_count}
                onChange={(e) => setFormData({ ...formData, items_count: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="1"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#081F33] mb-2">Stripe Payment Link</label>
              <input
                type="url"
                value={formData.stripe_link}
                onChange={(e) => setFormData({ ...formData, stripe_link: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="https://buy.stripe.com/..."
              />
            </div>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#C96A2B] rounded focus:ring-[#C96A2B]"
                />
                <span className="text-sm text-[#081F33]">Active</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-[#C96A2B] rounded focus:ring-[#C96A2B]"
                />
                <span className="text-sm text-[#081F33]">Featured</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.category || !formData.price}
              className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button
              onClick={cancelEdit}
              className="border border-[#E5E7EB] text-[#4B5563] px-6 py-2 rounded-lg font-semibold hover:bg-[#F3F4F6] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#081F33]">{product.title}</div>
                    <div className="text-sm text-[#4B5563]">{product.items_count} item{product.items_count > 1 ? 's' : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-[#4B5563]">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-[#F3F4F6] text-[#4B5563] px-2 py-1 rounded-full">
                      {product.product_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#081F33]">
                    ${product.price}
                    {product.sale_price && (
                      <span className="text-sm text-green-600 ml-2">${product.sale_price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
