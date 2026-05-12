'use client';

import { useEffect, useState } from 'react';
import { supabase, Niche } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react';

export default function NichesAdminPage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchNiches();
  }, []);

  async function fetchNiches() {
    const { data } = await supabase
      .from('niches')
      .select('*')
      .order('display_order');
    
    setNiches(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.name || !formData.slug) {
      alert('Please enter both name and slug');
      return;
    }

    const nicheData = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      icon: formData.icon || null,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    if (editingId) {
      const { error } = await supabase
        .from('niches')
        .update(nicheData)
        .eq('id', editingId);
      
      if (error) alert('Error updating: ' + error.message);
      else { setEditingId(null); resetForm(); fetchNiches(); }
    } else {
      const { error } = await supabase
        .from('niches')
        .insert([{ ...nicheData, display_order: niches.length + 1 }]);
      
      if (error) alert('Error creating: ' + error.message);
      else { setIsCreating(false); resetForm(); fetchNiches(); }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this niche? This will NOT delete vault items in this niche.')) return;
    const { error } = await supabase.from('niches').delete().eq('id', id);
    if (error) alert('Error deleting: ' + error.message);
    else fetchNiches();
  }

  async function toggleActive(niche: Niche) {
    const { error } = await supabase
      .from('niches')
      .update({ is_active: !niche.is_active })
      .eq('id', niche.id);
    if (!error) fetchNiches();
  }

  function startEdit(niche: Niche) {
    setEditingId(niche.id);
    setFormData({
      name: niche.name,
      slug: niche.slug,
      icon: niche.icon || '',
      description: niche.description || '',
      is_active: niche.is_active,
    });
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      is_active: true,
    });
    setEditingId(null);
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
          <h1 className="text-2xl font-bold text-[#081F33]">Niches</h1>
          <p className="text-[#4B5563]">{niches.length} niches configured</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Niche
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#081F33] mb-6">
            {editingId ? 'Edit Niche' : 'New Niche'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  name: e.target.value,
                  slug: editingId ? formData.slug : e.target.value.toLowerCase().replace(/\s+/g, '-')
                })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., Plumbing"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., plumbing"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Icon (emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="🔧"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#C96A2B] rounded focus:ring-[#C96A2B]"
              />
              <span className="text-sm text-[#081F33]">Active (visible on website)</span>
            </label>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.slug}
              className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50"
            >
              {editingId ? 'Update Niche' : 'Create Niche'}
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

      {/* Niches Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {niches.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            No niches yet. Create your first niche to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Icon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {niches.map((niche) => (
                <tr key={niche.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-3xl">{niche.icon || '📦'}</td>
                  <td className="px-6 py-4 font-medium text-[#081F33]">{niche.name}</td>
                  <td className="px-6 py-4 text-[#4B5563] font-mono text-sm">{niche.slug}</td>
                  <td className="px-6 py-4 text-[#4B5563] text-sm">{niche.description || '—'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(niche)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${niche.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {niche.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {niche.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => startEdit(niche)} 
                        className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(niche.id)} 
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
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating a niche, you'll also need to create an industry page at{' '}
          <code className="bg-blue-100 px-1 rounded">/industries/[slug]</code> and add categories for it.
        </p>
      </div>
    </div>
  );
}
