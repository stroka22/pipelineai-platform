'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Plus, Trash2, Loader2, GripVertical, 
  Image as ImageIcon, Layers, Save, X, Upload
} from 'lucide-react';

interface GalleryItem {
  id: string;
  niche: string;
  type: 'single' | 'carousel' | 'video';
  title: string;
  images: string[];
  caption: string;
  display_order: number;
  is_active: boolean;
}

const NICHES = [
  { slug: 'real-estate', name: 'Real Estate' },
  { slug: 'hvac', name: 'HVAC' },
  { slug: 'roofing', name: 'Roofing' },
  { slug: 'plumbing', name: 'Plumbing' },
  { slug: 'chiropractor', name: 'Chiropractor' },
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState('real-estate');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formType, setFormType] = useState<'single' | 'carousel'>('single');
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [selectedNiche]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('niche', selectedNiche)
      .order('display_order', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'png';
    const filename = `gallery/${selectedNiche}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('Vault').upload(filename, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('Vault').getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadFile(file);
        setFormImages(prev => [...prev, url]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleFiles(files);
  }, [selectedNiche]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFiles(files);
  };

  const saveItem = async () => {
    if (formImages.length === 0) {
      alert('Add at least one image');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('gallery_items').insert({
        niche: selectedNiche,
        type: formType,
        title: formTitle || null,
        images: formImages,
        caption: formCaption || null,
        display_order: items.length,
        is_active: true,
      });

      if (error) throw error;

      setShowForm(false);
      setFormTitle('');
      setFormCaption('');
      setFormImages([]);
      setFormType('single');
      fetchItems();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    await supabase.from('gallery_items').delete().eq('id', id);
    fetchItems();
  };

  const toggleActive = async (item: GalleryItem) => {
    await supabase.from('gallery_items').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gallery Manager</h1>
              <p className="text-white/50 text-sm">Manage gallery content for niche pages</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Niche selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {NICHES.map(n => (
            <button
              key={n.slug}
              onClick={() => setSelectedNiche(n.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedNiche === n.slug ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add Gallery Item</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Type */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setFormType('single')}
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    formType === 'single' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Single Image
                </button>
                <button
                  onClick={() => setFormType('carousel')}
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    formType === 'carousel' ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Carousel
                </button>
              </div>

              {/* Title & Caption */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
                />
                <textarea
                  value={formCaption}
                  onChange={e => setFormCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm resize-none"
                />
              </div>

              {/* Image Upload */}
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-xl p-6 mb-6 transition-colors ${
                  dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'
                }`}
              >
                {formImages.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">{formImages.length} image{formImages.length !== 1 ? 's' : ''}</span>
                      <button onClick={() => setFormImages([])} className="text-xs text-red-400">Clear all</button>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {formImages.map((url, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                          <button
                            onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center gap-2 py-2 text-sm text-white/40 hover:text-white/60 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Add more images
                      <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                    <Upload className="w-8 h-8 text-white/20 mb-2" />
                    <p className="text-white/40 text-sm">Drag images here or click to upload</p>
                    <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
                  </label>
                )}
                {uploading && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </div>
                )}
              </div>

              {/* Save */}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={saveItem}
                  disabled={saving || formImages.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/40" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No gallery items for {NICHES.find(n => n.slug === selectedNiche)?.name}</p>
            <p className="text-sm mt-2">Click &quot;Add Item&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className={`bg-white/5 border rounded-xl p-4 ${item.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                <div className="flex items-start gap-4">
                  {/* Thumbnails */}
                  <div className="flex gap-1 flex-shrink-0">
                    {item.images.slice(0, 4).map((url, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {item.images.length > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40">
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === 'carousel' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.type === 'carousel' ? `Carousel (${item.images.length} slides)` : 'Single'}
                      </span>
                      {!item.is_active && <span className="text-xs text-white/30">Hidden</span>}
                    </div>
                    {item.title && <p className="font-medium text-sm truncate">{item.title}</p>}
                    {item.caption && <p className="text-white/40 text-xs mt-1 truncate">{item.caption}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        item.is_active ? 'bg-green-600/20 text-green-400' : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
