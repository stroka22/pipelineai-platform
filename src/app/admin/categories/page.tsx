'use client';

import { useEffect, useState } from 'react';
import { supabase, Category, Niche } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterNiche, setFilterNiche] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    niche_slug: '',
    icon: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [catsRes, nichesRes] = await Promise.all([
      supabase.from('categories').select('*').order('niche_slug').order('display_order'),
      supabase.from('niches').select('*').order('display_order')
    ]);
    
    setCategories(catsRes.data || []);
    setNiches(nichesRes.data || []);
    
    if (nichesRes.data && nichesRes.data.length > 0 && !formData.niche_slug) {
      setFormData(prev => ({ ...prev, niche_slug: nichesRes.data[0].slug }));
    }
    
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.name || !formData.niche_slug) {
      alert('Please fill in name and niche');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          niche_slug: formData.niche_slug,
          icon: formData.icon || null,
          display_order: formData.display_order,
        })
        .eq('id', editingId);
      
      if (error) alert('Error updating: ' + error.message);
      else { setEditingId(null); resetForm(); fetchData(); }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: formData.name,
          niche_slug: formData.niche_slug,
          icon: formData.icon || null,
          display_order: formData.display_order,
        }]);
      
      if (error) alert('Error creating: ' + error.message);
      else { setIsCreating(false); resetForm(); fetchData(); }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Vault items using it will need to be updated.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchData();
  }

  async function toggleActive(cat: Category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id);
    if (!error) fetchData();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      niche_slug: cat.niche_slug,
      icon: cat.icon || '',
      display_order: cat.display_order,
    });
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      niche_slug: niches[0]?.slug || '',
      icon: '',
      display_order: 0,
    });
    setEditingId(null);
  }

  const filteredCategories = filterNiche === 'all' 
    ? categories 
    : categories.filter(c => c.niche_slug === filterNiche);

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
          <h1 className="text-2xl font-bold text-[#081F33]">Categories</h1>
          <p className="text-[#4B5563]">{categories.length} categories across {niches.length} niches</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
          >
            <option value="all">All Niches</option>
            {niches.map(n => (
              <option key={n.id} value={n.slug}>{n.name}</option>
            ))}
          </select>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#081F33] mb-6">
            {editingId ? 'Edit Category' : 'New Category'}
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., Roaches"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Niche *</label>
              <select
                value={formData.niche_slug}
                onChange={(e) => setFormData({ ...formData, niche_slug: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              >
                {niches.map(n => (
                  <option key={n.id} value={n.slug}>{n.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Icon (emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="🪳"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.niche_slug}
              className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
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

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            No categories yet
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Icon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Niche</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-2xl">{cat.icon || '—'}</td>
                  <td className="px-6 py-4 font-medium text-[#081F33]">{cat.name}</td>
                  <td className="px-6 py-4 text-[#4B5563]">
                    {niches.find(n => n.slug === cat.niche_slug)?.name || cat.niche_slug}
                  </td>
                  <td className="px-6 py-4 text-[#4B5563]">{cat.display_order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {cat.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(cat)} className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
    </div>
  );
}
