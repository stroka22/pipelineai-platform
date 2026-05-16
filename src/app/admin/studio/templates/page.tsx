'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  ArrowLeft,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Star,
  Copy,
  Check
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ['image', 'carousel', 'copy'];
const NICHES = [
  '', 'Roofing', 'HVAC', 'Plumbing', 'Pest Control', 'Med Spa', 'Dental', 'Chiropractic',
  'Real Estate', 'Mortgage', 'Insurance', 'Law Firm', 'Auto Repair', 'Landscaping',
  'Gym/Fitness', 'Salon', 'Restaurant', 'Church', 'Financial Planning'
];
const STYLES = ['', 'cinematic', 'luxury', 'modern', 'minimal', 'bold', 'warm', 'corporate', 'editorial'];

interface PromptTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  niche: string;
  prompt_text: string;
  style_preset: string;
  aspect_ratio: string;
  is_featured: boolean;
}

const emptyTemplate: PromptTemplate = {
  name: '',
  description: '',
  category: 'image',
  niche: '',
  prompt_text: '',
  style_preset: '',
  aspect_ratio: '1:1',
  is_featured: false,
};

export default function PromptTemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [formData, setFormData] = useState<PromptTemplate>(emptyTemplate);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false });
    
    if (data) setTemplates(data);
    setLoading(false);
  }

  function startEditing(template: PromptTemplate) {
    setEditingTemplate(template);
    setFormData(template);
    setShowForm(true);
  }

  function startNew() {
    setEditingTemplate(null);
    setFormData(emptyTemplate);
    setShowForm(true);
  }

  async function saveTemplate() {
    setSaving(true);
    
    try {
      if (editingTemplate?.id) {
        const { error } = await supabase
          .from('prompt_templates')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prompt_templates')
          .insert(formData);
        
        if (error) throw error;
      }
      
      await loadTemplates();
      setShowForm(false);
      setEditingTemplate(null);
      setFormData(emptyTemplate);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);
    
    if (!error) {
      loadTemplates();
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase
      .from('prompt_templates')
      .update({ is_featured: !current })
      .eq('id', id);
    
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, is_featured: !current } : t
    ));
  }

  function copyPrompt(template: PromptTemplate) {
    navigator.clipboard.writeText(template.prompt_text);
    setCopiedId(template.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredTemplates = templates.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterNiche && t.niche !== filterNiche) return false;
    return true;
  });

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
                <FileText className="w-5 h-5 text-green-500" />
                Prompt Templates
              </h1>
            </div>
            <button
              onClick={startNew}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#B55D24]"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="">All Niches</option>
            {NICHES.filter(Boolean).map(niche => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Template Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Cinematic Social Post"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of what this template creates"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Niche (optional)</label>
                    <select
                      value={formData.niche}
                      onChange={(e) => setFormData({...formData, niche: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">General</option>
                      {NICHES.filter(Boolean).map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Style Preset</label>
                    <select
                      value={formData.style_preset}
                      onChange={(e) => setFormData({...formData, style_preset: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">None</option>
                      {STYLES.filter(Boolean).map(style => (
                        <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Aspect Ratio</label>
                    <select
                      value={formData.aspect_ratio}
                      onChange={(e) => setFormData({...formData, aspect_ratio: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="4:5">4:5 Portrait</option>
                      <option value="9:16">9:16 Story</option>
                      <option value="16:9">16:9 Landscape</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Prompt Text *</label>
                  <textarea
                    value={formData.prompt_text}
                    onChange={(e) => setFormData({...formData, prompt_text: e.target.value})}
                    placeholder="The full prompt text that will be used for generation..."
                    rows={6}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-white/70">Featured template (shows at top)</span>
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
                  onClick={saveTemplate}
                  disabled={saving || !formData.name || !formData.prompt_text}
                  className="bg-[#C96A2B] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#B55D24] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C96A2B] animate-spin" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Templates Found</h3>
            <p className="text-white/50 mb-4">Create reusable prompt templates for faster content generation</p>
            <button
              onClick={startNew}
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Template
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-[#111111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{template.name}</h3>
                      {template.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        template.category === 'image' ? 'bg-orange-500/20 text-orange-400' :
                        template.category === 'carousel' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {template.category}
                      </span>
                      {template.niche && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          {template.niche}
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-white/50 text-sm mb-2">{template.description}</p>
                    )}
                    <p className="text-white/40 text-sm line-clamp-2">{template.prompt_text}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => copyPrompt(template)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
                      title="Copy prompt"
                    >
                      {copiedId === template.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleFeatured(template.id!, template.is_featured)}
                      className={`p-2 rounded-lg ${template.is_featured ? 'text-yellow-500' : 'text-white/40 hover:text-yellow-500'}`}
                      title="Toggle featured"
                    >
                      <Star className={`w-4 h-4 ${template.is_featured ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => startEditing(template)}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id!)}
                      className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
