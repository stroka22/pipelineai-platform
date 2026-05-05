'use client';

import { useEffect, useState } from 'react';
import { supabase, VaultItem } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X, Image as ImageIcon, Eye } from 'lucide-react';
import Link from 'next/link';

const NICHES = ['pest-control', 'hvac', 'roofing'] as const;
const CONTENT_TYPES = ['carousel', 'reel', 'image'] as const;

export default function VaultAdminPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [filterNiche, setFilterNiche] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    niche: 'pest-control' as typeof NICHES[number],
    category: '',
    content_type: 'carousel' as typeof CONTENT_TYPES[number],
    folder_path: '',
    images: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .order('niche')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching vault items:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    const imagesArray = formData.images
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const itemData = {
      title: formData.title,
      niche: formData.niche,
      category: formData.category,
      content_type: formData.content_type,
      slide_count: imagesArray.length,
      folder_path: formData.folder_path,
      images: imagesArray,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('vault_items')
        .update(itemData)
        .eq('id', editingItem.id);
      
      if (error) {
        alert('Error updating item: ' + error.message);
      } else {
        setEditingItem(null);
        setIsCreating(false);
        resetForm();
        fetchItems();
      }
    } else {
      const { error } = await supabase
        .from('vault_items')
        .insert([itemData]);
      
      if (error) {
        alert('Error creating item: ' + error.message);
      } else {
        setIsCreating(false);
        resetForm();
        fetchItems();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this vault item?')) return;
    
    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchItems();
    }
  }

  async function toggleActive(item: VaultItem) {
    const { error } = await supabase
      .from('vault_items')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    
    if (!error) {
      fetchItems();
    }
  }

  function startEdit(item: VaultItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      niche: item.niche,
      category: item.category,
      content_type: item.content_type,
      folder_path: item.folder_path,
      images: item.images.join('\n'),
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      niche: 'pest-control',
      category: '',
      content_type: 'carousel',
      folder_path: '',
      images: '',
      is_active: true,
      display_order: 0,
    });
    setEditingItem(null);
  }

  function generateImagePaths() {
    if (!formData.folder_path) {
      alert('Enter a folder path first');
      return;
    }
    const count = parseInt(prompt('How many images?') || '0');
    if (count <= 0) return;
    
    const prefix = prompt('Image filename prefix (e.g., "Slide" for Slide-1.PNG)') || 'Image';
    const ext = prompt('File extension (e.g., PNG, jpg)') || 'PNG';
    
    const paths = [];
    for (let i = 1; i <= count; i++) {
      paths.push(`${formData.folder_path}/${prefix}-${i}.${ext}`);
    }
    setFormData({ ...formData, images: paths.join('\n') });
  }

  const filteredItems = filterNiche === 'all' 
    ? items 
    : items.filter(i => i.niche === filterNiche);

  const nicheColors: Record<string, string> = {
    'pest-control': 'bg-green-100 text-green-800',
    'hvac': 'bg-blue-100 text-blue-800',
    'roofing': 'bg-orange-100 text-orange-800',
  };

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
          <h1 className="text-2xl font-bold text-[#081F33]">Content Vault</h1>
          <p className="text-[#4B5563]">{items.length} items across all niches</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
          >
            <option value="all">All Niches</option>
            <option value="pest-control">Pest Control</option>
            <option value="hvac">HVAC</option>
            <option value="roofing">Roofing</option>
          </select>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Add Vault Content:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Drop images in: <code className="bg-blue-100 px-1 rounded">/public/vault/[niche]/carousels/[folder-name]/</code></li>
          <li>Click &quot;Add Item&quot; and fill in the details</li>
          <li>Use &quot;Generate Paths&quot; to auto-create image paths</li>
          <li>Save and deploy - images will appear in the vault</li>
        </ol>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#081F33] mb-6">
            {editingItem ? 'Edit Vault Item' : 'New Vault Item'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., One Roach Is A Warning Sign"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Niche *</label>
              <select
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value as typeof NICHES[number] })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              >
                <option value="pest-control">Pest Control</option>
                <option value="hvac">HVAC</option>
                <option value="roofing">Roofing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="e.g., Roaches, Termites, AC Repair"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Content Type *</label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as typeof CONTENT_TYPES[number] })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              >
                <option value="carousel">Carousel</option>
                <option value="reel">Reel</option>
                <option value="image">Single Image</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Folder Path *</label>
              <input
                type="text"
                value={formData.folder_path}
                onChange={(e) => setFormData({ ...formData, folder_path: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                placeholder="/vault/pest-control/carousels/roach-warning"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#081F33]">Image Paths * (one per line)</label>
                <button
                  type="button"
                  onClick={generateImagePaths}
                  className="text-sm text-[#C96A2B] hover:underline"
                >
                  Generate Paths
                </button>
              </div>
              <textarea
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B] font-mono text-sm"
                placeholder="/vault/pest-control/carousels/roach-warning/Slide-1.PNG
/vault/pest-control/carousels/roach-warning/Slide-2.PNG
..."
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
                <span className="text-sm text-[#081F33]">Active (visible in vault)</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.category || !formData.folder_path || !formData.images}
              className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingItem ? 'Update Item' : 'Create Item'}
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

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            No vault items yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Niche</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Slides</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
                        </div>
                        <div className="font-medium text-[#081F33]">{item.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${nicheColors[item.niche]}`}>
                        {item.niche}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-[#F3F4F6] text-[#4B5563] px-2 py-1 rounded-full capitalize">
                        {item.content_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{item.slide_count}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          item.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {item.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/vault/${item.niche}`}
                          target="_blank"
                          className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
