'use client';

import { useEffect, useState } from 'react';
import { supabase, Coupon } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    expires_at: '',
    usage_limit: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching coupons:', error);
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      expires_at: formData.expires_at || null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      is_active: formData.is_active,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);
      
      if (error) {
        alert('Error updating coupon: ' + error.message);
      } else {
        setEditingCoupon(null);
        setIsCreating(false);
        resetForm();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert([couponData]);
      
      if (error) {
        alert('Error creating coupon: ' + error.message);
      } else {
        setIsCreating(false);
        resetForm();
        fetchCoupons();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchCoupons();
    }
  }

  async function toggleActive(coupon: Coupon) {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);
    
    if (!error) {
      fetchCoupons();
    }
  }

  function startEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      usage_limit: coupon.usage_limit?.toString() || '',
      is_active: coupon.is_active,
    });
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      expires_at: '',
      usage_limit: '',
      is_active: true,
    });
    setEditingCoupon(null);
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
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
          <h1 className="text-2xl font-bold text-[#081F33]">Coupons</h1>
          <p className="text-[#4B5563]">{coupons.length} coupons created</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#081F33] mb-6">
            {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Coupon Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B] uppercase"
                  placeholder="SUMMER20"
                />
                <button
                  onClick={generateCode}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] text-sm"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Discount Type *</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">
                Discount Value * ({formData.discount_type === 'percentage' ? '%' : '$'})
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder={formData.discount_type === 'percentage' ? '20' : '50'}
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Expires At</label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Usage Limit</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="Unlimited if empty"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#C96A2B] rounded focus:ring-[#C96A2B]"
                />
                <span className="text-sm text-[#081F33]">Active</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.code || !formData.discount_value}
              className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button
              onClick={() => { setIsCreating(false); resetForm(); }}
              className="border border-[#E5E7EB] text-[#4B5563] px-6 py-2 rounded-lg font-semibold hover:bg-[#F3F4F6] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            No coupons created yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-[#081F33] bg-[#F3F4F6] px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#C96A2B]">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `$${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {coupon.times_used} / {coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {coupon.expires_at 
                        ? new Date(coupon.expires_at).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          coupon.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {coupon.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
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
        )}
      </div>
    </div>
  );
}
