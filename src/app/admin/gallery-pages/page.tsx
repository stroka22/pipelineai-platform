'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Plus, Loader2, Save, Trash2, Eye, Globe, 
  Palette, X, Check, Edit3
} from 'lucide-react';

interface NichePage {
  id: string;
  slug: string;
  name: string;
  gallery_slug: string;
  hero_headline: string;
  hero_subtitle: string;
  accent_color: string;
  has_gallery_page: boolean;
  icon?: string;
}

interface Package {
  id: string;
  niche_slug: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta_text: string;
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
}

const DEFAULT_PACKAGES = [
  {
    name: 'Branding Essentials',
    price: '$497',
    period: '/month',
    description: 'Consistent branded presence that builds recognition',
    features: ['8 branded posts/month', '2 carousels/month', 'Captions included', 'Consistent branding', 'Basic strategy support'],
    cta_text: 'Start Branding',
    is_popular: false,
    display_order: 1,
  },
  {
    name: 'Growth Branding',
    price: '$997',
    period: '/month',
    description: 'Full content engine that drives engagement and leads',
    features: ['16–20 posts/month', '4 carousels/month', 'Reels & motion content', 'Educational content', 'Seasonal campaigns', 'Captions included', 'Monthly planning', 'Profile optimization'],
    cta_text: 'Accelerate Growth',
    is_popular: true,
    display_order: 2,
  },
  {
    name: 'Authority Branding',
    price: '$1,997–2,500+',
    period: '/month',
    description: 'Dominant market presence that positions you as THE authority',
    features: ['Daily content', 'Advanced reels & carousels', 'Listing promotions', 'Luxury branding campaigns', 'Story content', 'Priority turnaround', 'Growth strategy support'],
    cta_text: 'Claim Authority',
    is_popular: false,
    display_order: 3,
  },
];

export default function AdminGalleryPagesPage() {
  const [niches, setNiches] = useState<NichePage[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNiche, setEditingNiche] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create form
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  
  // Edit form
  const [editHeadline, setEditHeadline] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editAccent, setEditAccent] = useState('#3b82f6');
  const [editSlug, setEditSlug] = useState('');
  const [editPackages, setEditPackages] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [nichesRes, packagesRes] = await Promise.all([
      supabase.from('niches').select('*').order('name'),
      supabase.from('gallery_packages').select('*').order('display_order'),
    ]);
    setNiches(nichesRes.data || []);
    setPackages(packagesRes.data || []);
    setLoading(false);
  };

  const startEdit = (niche: NichePage) => {
    setEditingNiche(niche.id);
    setEditHeadline(niche.hero_headline || `Dominate Your Local ${niche.name} Market`);
    setEditSubtitle(niche.hero_subtitle || `Premium branded content that positions you as the go-to ${niche.name.toLowerCase()} authority.`);
    setEditAccent(niche.accent_color || '#3b82f6');
    setEditSlug(niche.gallery_slug || niche.slug);
    
    // Load packages for this niche
    const nichePkgs = packages.filter(p => p.niche_slug === niche.gallery_slug || p.niche_slug === niche.slug);
    if (nichePkgs.length > 0) {
      setEditPackages(nichePkgs.map(p => ({ ...p })));
    } else {
      setEditPackages(DEFAULT_PACKAGES.map(p => ({ ...p, niche_slug: niche.slug })));
    }
  };

  const createNichePage = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    
    setSaving(true);
    try {
      // Check if niche already exists
      const { data: existing } = await supabase
        .from('niches')
        .select('id')
        .eq('slug', newSlug)
        .single();

      if (existing) {
        // Update existing niche to have gallery page
        await supabase
          .from('niches')
          .update({
            has_gallery_page: true,
            gallery_slug: newSlug,
            hero_headline: `Dominate Your Local ${newName} Market`,
            hero_subtitle: `Premium branded content that positions you as the go-to ${newName.toLowerCase()} authority. Professional carousels, posts, and campaigns — designed to make you impossible to ignore.`,
            accent_color: '#3b82f6',
          })
          .eq('id', existing.id);

        // Add default packages
        for (const pkg of DEFAULT_PACKAGES) {
          await supabase.from('gallery_packages').insert({
            niche_slug: newSlug,
            ...pkg,
          });
        }
      } else {
        // Create new niche
        await supabase.from('niches').insert({
          slug: newSlug,
          name: newName,
          has_gallery_page: true,
          gallery_slug: newSlug,
          hero_headline: `Dominate Your Local ${newName} Market`,
          hero_subtitle: `Premium branded content that positions you as the go-to ${newName.toLowerCase()} authority. Professional carousels, posts, and campaigns — designed to make you impossible to ignore.`,
          accent_color: '#3b82f6',
          is_active: true,
        });

        // Add default packages
        for (const pkg of DEFAULT_PACKAGES) {
          await supabase.from('gallery_packages').insert({
            niche_slug: newSlug,
            ...pkg,
          });
        }
      }

      setShowCreateModal(false);
      setNewName('');
      setNewSlug('');
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editingNiche) return;
    setSaving(true);
    try {
      await supabase
        .from('niches')
        .update({
          hero_headline: editHeadline,
          hero_subtitle: editSubtitle,
          accent_color: editAccent,
          gallery_slug: editSlug,
        })
        .eq('id', editingNiche);

      // Save packages
      for (const pkg of editPackages) {
        if (pkg.id) {
          await supabase
            .from('gallery_packages')
            .update({
              name: pkg.name,
              price: pkg.price,
              period: pkg.period,
              description: pkg.description,
              features: pkg.features,
              cta_text: pkg.cta_text,
              is_popular: pkg.is_popular,
              display_order: pkg.display_order,
            })
            .eq('id', pkg.id);
        } else {
          await supabase.from('gallery_packages').insert({
            niche_slug: editSlug,
            name: pkg.name,
            price: pkg.price,
            period: pkg.period,
            description: pkg.description,
            features: pkg.features,
            cta_text: pkg.cta_text,
            is_popular: pkg.is_popular,
            display_order: pkg.display_order,
            is_active: true,
          });
        }
      }

      setEditingNiche(null);
      fetchData();
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    }
    setSaving(false);
  };

  const toggleGalleryPage = async (niche: NichePage) => {
    await supabase
      .from('niches')
      .update({ has_gallery_page: !niche.has_gallery_page })
      .eq('id', niche.id);
    fetchData();
  };

  const galleryUrl = (slug: string) => `/gallery/${slug}`;

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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" />
                Gallery Pages
              </h1>
              <p className="text-white/50 text-sm">Create and customize niche gallery pages</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Gallery Page
          </button>
        </div>

        {/* Niche List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/40" /></div>
        ) : (
          <div className="space-y-4">
            {niches.map(niche => {
              const nichePkgs = packages.filter(p => p.niche_slug === niche.gallery_slug || p.niche_slug === niche.slug);
              return (
                <div key={niche.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon + Name */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: niche.accent_color ? `${niche.accent_color}33` : '#3b82f633' }}>
                      {niche.icon || '🏢'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{niche.name}</span>
                        {niche.has_gallery_page ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Live</span>
                        ) : (
                          <span className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      <div className="text-sm text-white/40">
                        {niche.has_gallery_page ? (
                          <a href={galleryUrl(niche.gallery_slug || niche.slug)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {galleryUrl(niche.gallery_slug || niche.slug)}
                          </a>
                        ) : (
                          `Slug: ${niche.slug}`
                        )}
                        {' • '}{nichePkgs.length} packages
                      </div>
                      {niche.hero_headline && (
                        <div className="text-xs text-white/25 mt-1 truncate">{niche.hero_headline}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {niche.has_gallery_page && (
                        <a
                          href={galleryUrl(niche.gallery_slug || niche.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"
                          title="View page"
                        >
                          <Eye className="w-4 h-4 text-white/40" />
                        </a>
                      )}
                      <button
                        onClick={() => startEdit(niche)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => toggleGalleryPage(niche)}
                        className={`p-2 rounded-lg ${niche.has_gallery_page ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400' : 'bg-white/5 hover:bg-white/10 text-white/40'}`}
                        title={niche.has_gallery_page ? 'Deactivate' : 'Activate'}
                      >
                        <Globe className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingNiche && (
          <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-3xl w-full my-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Edit Gallery Page</h2>
                <button onClick={() => setEditingNiche(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* URL Slug */}
              <div className="mb-6">
                <label className="text-sm text-white/60 mb-2 block">Page URL</label>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <span>getpipelineai.com/gallery/</span>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={e => setEditSlug(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white flex-1"
                  />
                </div>
              </div>

              {/* Hero */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Hero Headline</label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={e => setEditHeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Hero Subtitle</label>
                  <textarea
                    value={editSubtitle}
                    onChange={e => setEditSubtitle(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Accent Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={editAccent}
                      onChange={e => setEditAccent(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editAccent}
                      onChange={e => setEditAccent(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-32"
                    />
                    <div className="flex gap-2">
                      {['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'].map(c => (
                        <button
                          key={c}
                          onClick={() => setEditAccent(c)}
                          className={`w-8 h-8 rounded-lg border-2 ${editAccent === c ? 'border-white' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Packages */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-white/60">Packages</label>
                  <button
                    onClick={() => setEditPackages(prev => [...prev, { name: 'New Package', price: '$0', period: '/month', description: '', features: [], cta_text: 'Get Started', is_popular: false, display_order: prev.length + 1 }])}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Package
                  </button>
                </div>
                <div className="space-y-4">
                  {editPackages.map((pkg, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Package {i + 1}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, is_popular: !p.is_popular } : { ...p, is_popular: false }))}
                            className={`text-xs px-2 py-1 rounded ${pkg.is_popular ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}
                          >
                            Popular
                          </button>
                          <button onClick={() => setEditPackages(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={pkg.name} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))} placeholder="Package name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                          <input value={pkg.price} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, price: e.target.value } : p))} placeholder="Price" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm flex-1" />
                          <input value={pkg.period} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, period: e.target.value } : p))} placeholder="/month" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-20" />
                        </div>
                        <input value={pkg.description} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, description: e.target.value } : p))} placeholder="Description" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                        <input value={pkg.cta_text} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, cta_text: e.target.value } : p))} placeholder="Button text" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                        <input value={pkg.features?.join(', ') || ''} onChange={e => setEditPackages(prev => prev.map((p, idx) => idx === i ? { ...p, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) } : p))} placeholder="Features (comma separated)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3">
                <button onClick={() => setEditingNiche(null)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">New Gallery Page</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Niche Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')); }}
                    placeholder="e.g., HVAC, Chiropractor, Med Spa"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">URL Slug</label>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span>/gallery/</span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={e => setNewSlug(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white flex-1"
                    />
                  </div>
                </div>
                <p className="text-white/30 text-xs">
                  Creates the niche with default packages (Branding Essentials, Growth, Authority). Customize after creation.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-lg">Cancel</button>
                <button onClick={createNichePage} disabled={saving || !newName.trim()} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Create Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
