'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, VaultItem } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X, Image as ImageIcon, Eye, Upload, Loader2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const NICHES = ['pest-control', 'hvac', 'roofing'] as const;
const CONTENT_TYPES = ['carousel', 'reel', 'image'] as const;

export default function VaultAdminPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    niche: 'pest-control' as typeof NICHES[number],
    category: '',
    content_type: 'carousel' as typeof CONTENT_TYPES[number],
    is_active: true,
    display_order: 0,
  });
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.niche}/${formData.category || 'uncategorized'}/${Date.now()}-${i}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('vault')
        .upload(fileName, file);
      
      if (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}: ${error.message}`);
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vault')
          .getPublicUrl(fileName);
        
        newImages.push(publicUrl);
      }
    }
    
    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
    setUploadProgress('');
    e.target.value = ''; // Reset input
  }

  function removeImage(index: number) {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }

  function reorderImage(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= uploadedImages.length) return;
    
    const newImages = [...uploadedImages];
    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
    setUploadedImages(newImages);
  }

  async function handleSave() {
    if (uploadedImages.length === 0 && !editingItem) {
      alert('Please upload at least one image');
      return;
    }

    const itemData = {
      title: formData.title,
      niche: formData.niche,
      category: formData.category,
      content_type: formData.content_type,
      slide_count: uploadedImages.length || editingItem?.slide_count || 0,
      folder_path: '', // Not used with Supabase storage
      images: uploadedImages.length > 0 ? uploadedImages : editingItem?.images || [],
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
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setUploadedImages(item.images);
    setIsCreating(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      niche: 'pest-control',
      category: '',
      content_type: 'carousel',
      is_active: true,
      display_order: 0,
    });
    setUploadedImages([]);
    setEditingItem(null);
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
              <label className="block text-sm font-medium text-[#081F33] mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
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
            
            {/* Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#081F33] mb-2">
                Images * ({uploadedImages.length} uploaded)
              </label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#C96A2B] transition-colors mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-[#C96A2B] animate-spin mb-2" />
                      <p className="text-sm text-[#4B5563]">{uploadProgress}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-[#9CA3AF] mb-2" />
                      <p className="text-sm text-[#4B5563]">
                        <span className="text-[#C96A2B] font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG, MP4 up to 50MB each</p>
                    </div>
                  )}
                </label>
              </div>
              
              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square bg-[#F3F4F6] rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                        <button
                          onClick={() => reorderImage(index, 'up')}
                          disabled={index === 0}
                          className="p-1 bg-white/20 rounded hover:bg-white/40 disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4 text-white rotate-90" />
                        </button>
                        <button
                          onClick={() => removeImage(index)}
                          className="p-1 bg-red-500/80 rounded hover:bg-red-500"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => reorderImage(index, 'down')}
                          disabled={index === uploadedImages.length - 1}
                          className="p-1 bg-white/20 rounded hover:bg-white/40 disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4 text-white rotate-90" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.category || (uploadedImages.length === 0 && !editingItem)}
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
                        <div className="w-12 h-12 bg-[#F3F4F6] rounded-lg overflow-hidden relative">
                          {item.images[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
                            </div>
                          )}
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
