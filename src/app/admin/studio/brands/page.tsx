'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Globe,
  Phone,
  Mail,
  Palette
} from 'lucide-react';


const NICHES = [
  'Roofing', 'HVAC', 'Plumbing', 'Pest Control', 'Med Spa', 'Dental', 'Chiropractic',
  'Real Estate', 'Mortgage', 'Insurance', 'Law Firm', 'Auto Repair', 'Landscaping',
  'Gym/Fitness', 'Salon', 'Restaurant', 'Church', 'Financial Planning', 'General'
];

const TONES = [
  'Professional', 'Friendly', 'Authority', 'Luxury', 'Casual', 'Educational', 
  'Inspirational', 'Direct', 'Conversational', 'Bold'
];

interface BrandProfile {
  id?: string;
  name: string;
  business_name: string;
  niche: string;
  website: string;
  phone: string;
  email: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  tone: string;
  tagline: string;
  instagram_handle: string;
  facebook_handle: string;
  is_default: boolean;
}

const emptyBrand: BrandProfile = {
  name: '',
  business_name: '',
  niche: 'General',
  website: '',
  phone: '',
  email: '',
  primary_color: '#C96A2B',
  secondary_color: '#081F33',
  accent_color: '#ffffff',
  tone: 'Professional',
  tagline: '',
  instagram_handle: '',
  facebook_handle: '',
  is_default: false,
};

export default function BrandProfilesPage() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandProfile | null>(null);
  const [formData, setFormData] = useState<BrandProfile>(emptyBrand);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (data) setBrands(data);
    setLoading(false);
  }

  function startEditing(brand: BrandProfile) {
    setEditingBrand(brand);
    setFormData(brand);
    setShowForm(true);
  }

  function startNew() {
    setEditingBrand(null);
    setFormData(emptyBrand);
    setShowForm(true);
  }

  async function saveBrand() {
    setSaving(true);
    
    try {
      if (editingBrand?.id) {
        // Update
        const { error } = await supabase
          .from('brand_profiles')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBrand.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('brand_profiles')
          .insert(formData);
        
        if (error) throw error;
      }
      
      await loadBrands();
      setShowForm(false);
      setEditingBrand(null);
      setFormData(emptyBrand);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save brand profile');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(id: string) {
    if (!confirm('Delete this brand profile?')) return;
    
    const { error } = await supabase
      .from('brand_profiles')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (!error) {
      loadBrands();
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/studio" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Brand Profiles
              </h1>
            </div>
            <button
              onClick={startNew}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#B55D24]"
            >
              <Plus className="w-4 h-4" />
              New Brand
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingBrand ? 'Edit Brand Profile' : 'New Brand Profile'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Profile Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Client - ABC Roofing"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Business Name *</label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        placeholder="e.g., ABC Roofing Co."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Niche</label>
                      <select
                        value={formData.niche}
                        onChange={(e) => setFormData({...formData, niche: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      >
                        {NICHES.map(niche => (
                          <option key={niche} value={niche}>{niche}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Brand Tone</label>
                      <select
                        value={formData.tone}
                        onChange={(e) => setFormData({...formData, tone: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      >
                        {TONES.map(tone => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                      placeholder="e.g., Quality You Can Trust"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">
                        <Globe className="w-3 h-3 inline mr-1" />
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">
                        <Phone className="w-3 h-3 inline mr-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="contact@example.com"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Instagram</label>
                      <input
                        type="text"
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                        placeholder="@username"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Brand Colors
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Primary</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Secondary</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Accent</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Default Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-white/70">Set as default brand profile</span>
                </label>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBrand}
                  disabled={saving || !formData.name || !formData.business_name}
                  className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#B55D24] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Brand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C96A2B] animate-spin" />
          </div>
        ) : brands.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
            <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Brand Profiles Yet</h3>
            <p className="text-white/50 mb-4">Create brand profiles to save client information for quick content generation</p>
            <button
              onClick={startNew}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Brand
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{brand.name}</h3>
                    <p className="text-white/50 text-sm">{brand.business_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(brand)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBrand(brand.id!)}
                      className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="text-white/40">Niche:</span>
                    {brand.niche}
                  </div>
                  {brand.website && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Globe className="w-3 h-3" />
                      {brand.website.replace(/^https?:\/\//, '')}
                    </div>
                  )}
                  {brand.phone && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Phone className="w-3 h-3" />
                      {brand.phone}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20"
                    style={{ backgroundColor: brand.primary_color }}
                    title="Primary"
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20"
                    style={{ backgroundColor: brand.secondary_color }}
                    title="Secondary"
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20"
                    style={{ backgroundColor: brand.accent_color }}
                    title="Accent"
                  />
                </div>
                
                {brand.is_default && (
                  <div className="mt-3 text-xs text-[#C96A2B] font-medium">
                    ★ Default Brand
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
