'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Download,
  RefreshCw,
  Save,
  Image as ImageIcon,
  Wand2,
  Building2,
  ChevronDown,
  Copy,
  Check,
  Upload,
  X,
  Eye
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic lighting, editorial feel' },
  { id: 'luxury', name: 'Luxury', description: 'High-end, sophisticated aesthetic' },
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, focused composition' },
  { id: 'bold', name: 'Bold', description: 'High contrast, attention-grabbing' },
  { id: 'warm', name: 'Warm', description: 'Inviting, comfortable feel' },
  { id: 'corporate', name: 'Corporate', description: 'Professional, trustworthy' },
  { id: 'editorial', name: 'Editorial', description: 'Magazine-quality visuals' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square (1:1)', size: '1024x1024', description: 'Instagram, Facebook' },
  { id: '4:5', name: 'Portrait (4:5)', size: '1024x1280', description: 'Instagram Feed' },
  { id: '9:16', name: 'Story (9:16)', size: '1024x1792', description: 'Stories, Reels, TikTok' },
  { id: '16:9', name: 'Landscape (16:9)', size: '1792x1024', description: 'YouTube, LinkedIn' },
];

const NICHES = [
  'Roofing', 'HVAC', 'Plumbing', 'Pest Control', 'Med Spa', 'Dental', 'Chiropractic',
  'Real Estate', 'Mortgage', 'Insurance', 'Law Firm', 'Auto Repair', 'Landscaping',
  'Gym/Fitness', 'Salon', 'Restaurant', 'Church', 'Financial Planning', 'General'
];

const CONTENT_TYPES = [
  'Social Post', 'Ad', 'Quote Graphic', 'Educational', 'Lead Generation',
  'Promotional', 'Testimonial', 'Before/After', 'Announcement', 'General'
];

export default function GenerateImagePage() {
  const [mode, setMode] = useState<'prompt' | 'form'>('form');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState('');
  
  // Brand profiles
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  
  // Prompt templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Open prompt mode
  const [openPrompt, setOpenPrompt] = useState('');
  
  // Reference image
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [analyzingReference, setAnalyzingReference] = useState(false);
  
  // Form mode
  const [formData, setFormData] = useState({
    businessName: '',
    niche: 'General',
    contentType: 'Social Post',
    headline: '',
    bodyText: '',
    ctaText: '',
    style: 'modern',
    aspectRatio: '1:1',
    primaryColor: '#C96A2B',
    secondaryColor: '#081F33',
    mood: '',
    additionalDetails: '',
  });

  useEffect(() => {
    loadBrandsAndTemplates();
  }, []);

  async function loadBrandsAndTemplates() {
    const [brandsRes, templatesRes] = await Promise.all([
      supabase.from('brand_profiles').select('*').eq('is_archived', false),
      supabase.from('prompt_templates').select('*').eq('category', 'image'),
    ]);
    
    setBrands(brandsRes.data || []);
    setTemplates(templatesRes.data || []);
  }

  function applyBrand(brandId: string) {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setFormData(prev => ({
        ...prev,
        businessName: brand.business_name,
        niche: brand.niche || prev.niche,
        primaryColor: brand.primary_color || prev.primaryColor,
        secondaryColor: brand.secondary_color || prev.secondaryColor,
      }));
    }
    setSelectedBrand(brandId);
  }

  function applyTemplate(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (mode === 'prompt') {
        setOpenPrompt(template.prompt_text);
      } else {
        setFormData(prev => ({
          ...prev,
          style: template.style_preset || prev.style,
          aspectRatio: template.aspect_ratio || prev.aspectRatio,
          niche: template.niche || prev.niche,
        }));
      }
    }
    setSelectedTemplate(templateId);
  }

  function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onload = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function clearReference() {
    setReferenceImage(null);
    setReferenceFile(null);
  }

  function buildPromptFromForm(): string {
    const parts = [];
    
    parts.push(`Create a premium ${formData.style} style social media graphic for a ${formData.niche.toLowerCase()} business.`);
    
    if (formData.businessName) {
      parts.push(`The business name is "${formData.businessName}" and should be prominently displayed.`);
    }
    
    parts.push(`Content type: ${formData.contentType}.`);
    
    if (formData.headline) {
      parts.push(`Main headline: "${formData.headline}".`);
    }
    
    if (formData.bodyText) {
      parts.push(`Supporting text: "${formData.bodyText}".`);
    }
    
    if (formData.ctaText) {
      parts.push(`Call to action: "${formData.ctaText}".`);
    }
    
    parts.push(`Color scheme: primary color ${formData.primaryColor}, secondary color ${formData.secondaryColor}.`);
    
    if (formData.mood) {
      parts.push(`Mood/feeling: ${formData.mood}.`);
    }
    
    if (formData.additionalDetails) {
      parts.push(formData.additionalDetails);
    }
    
    parts.push('The image should be professional, high-quality, and optimized for social media. Text should be readable and well-positioned.');
    
    return parts.join(' ');
  }

  async function generateImage() {
    setLoading(true);
    setGeneratedImage(null);
    
    let prompt = mode === 'prompt' ? openPrompt : buildPromptFromForm();
    
    const aspectRatio = ASPECT_RATIOS.find(ar => ar.id === formData.aspectRatio);
    
    try {
      // If reference image provided, analyze it first
      if (referenceImage) {
        setProgress('Analyzing reference image...');
        
        const analysisResponse = await fetch('/api/studio/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: referenceImage }),
        });
        
        const analysisData = await analysisResponse.json();
        
        if (analysisData.success && analysisData.analysis) {
          prompt = `REFERENCE IMAGE STYLE TO MATCH:
${analysisData.analysis}

USER REQUEST:
${prompt}

Create an image that matches the style, composition, and aesthetic of the reference image while incorporating the user's request.`;
        }
        
        setProgress('Generating image...');
      }
      
      setPromptUsed(prompt);
      
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          size: aspectRatio?.size || '1024x1024',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate image');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }

  async function saveToLibrary() {
    if (!generatedImage) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase.from('generated_images').insert({
        image_url: generatedImage,
        prompt_used: promptUsed,
        brand_profile_id: selectedBrand || null,
        prompt_template_id: selectedTemplate || null,
        content_type: formData.contentType,
        niche: formData.niche,
        style: formData.style,
        aspect_ratio: formData.aspectRatio,
        title: formData.headline || formData.businessName || 'Generated Image',
      });
      
      if (error) throw error;
      alert('Saved to library!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function downloadImage() {
    if (!generatedImage) return;
    
    try {
      if (generatedImage.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = generatedImage;
        a.download = `pipeline-ai-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pipeline-ai-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch {
      window.open(generatedImage, '_blank');
    }
  }

  function copyPrompt() {
    navigator.clipboard.writeText(promptUsed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/studio" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#C96A2B]" />
              Generate Image
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setMode('form')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'form' ? 'bg-[#C96A2B] text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Structured Form
              </button>
              <button
                onClick={() => setMode('prompt')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'prompt' ? 'bg-[#C96A2B] text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Open Prompt
              </button>
            </div>

            {/* Reference Image */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                <Eye className="w-4 h-4 inline mr-1" />
                Reference Image (optional)
              </label>
              <p className="text-white/40 text-xs mb-3">
                Upload an image to match its style, colors, and composition
              </p>
              
              {referenceImage ? (
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={clearReference}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1 text-white/50 text-sm">
                    <p className="text-green-400 mb-1">✓ Reference loaded</p>
                    <p>AI will analyze this image and match its style when generating.</p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#C96A2B]/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-white/40 mx-auto mb-1" />
                    <span className="text-white/60 text-sm">Click to upload reference</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Brand & Template Selection */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Brand Profile
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => applyBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  >
                    <option value="">No brand selected</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Prompt Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  >
                    <option value="">No template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {mode === 'prompt' ? (
              /* Open Prompt Mode */
              <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Your Prompt
                </label>
                <textarea
                  value={openPrompt}
                  onChange={(e) => setOpenPrompt(e.target.value)}
                  placeholder="Describe the image you want to create in detail..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none"
                />
                <p className="text-white/40 text-xs mt-2">
                  Be specific about style, colors, composition, text content, and mood.
                </p>
              </div>
            ) : (
              /* Structured Form Mode */
              <div className="space-y-4">
                {/* Business Info */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
                  <h3 className="text-white font-semibold">Business Info</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        placeholder="e.g., Alpha Roofing"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Niche</label>
                      <select
                        value={formData.niche}
                        onChange={(e) => setFormData({...formData, niche: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      >
                        {NICHES.map(niche => (
                          <option key={niche} value={niche}>{niche}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
                  <h3 className="text-white font-semibold">Content</h3>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Content Type</label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      {CONTENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Headline (optional)</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({...formData, headline: e.target.value})}
                      placeholder="Main text to display"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Body Text (optional)</label>
                    <textarea
                      value={formData.bodyText}
                      onChange={(e) => setFormData({...formData, bodyText: e.target.value})}
                      placeholder="Supporting message"
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">CTA (optional)</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                      placeholder="e.g., Call Now, Learn More"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* Style */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
                  <h3 className="text-white font-semibold">Style & Format</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Visual Style</label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({...formData, style: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      >
                        {STYLE_PRESETS.map(style => (
                          <option key={style.id} value={style.id}>{style.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Aspect Ratio</label>
                      <select
                        value={formData.aspectRatio}
                        onChange={(e) => setFormData({...formData, aspectRatio: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      >
                        {ASPECT_RATIOS.map(ar => (
                          <option key={ar.id} value={ar.id}>{ar.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Secondary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Mood/Feeling (optional)</label>
                    <input
                      type="text"
                      value={formData.mood}
                      onChange={(e) => setFormData({...formData, mood: e.target.value})}
                      placeholder="e.g., trustworthy, energetic, calming"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Additional Details (optional)</label>
                    <textarea
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                      placeholder="Any specific requirements or elements to include..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateImage}
              disabled={loading || (mode === 'prompt' && !openPrompt.trim())}
              className="w-full bg-gradient-to-r from-[#C96A2B] to-[#E8863A] text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Preview</h3>
              
              <div className="aspect-square bg-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                {loading ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#C96A2B] animate-spin mx-auto mb-4" />
                    <p className="text-white/60">{progress || 'Creating your image...'}</p>
                    <p className="text-white/40 text-sm">This takes 20-40 seconds</p>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white/40">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Your generated image will appear here</p>
                  </div>
                )}
              </div>
              
              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-[#C96A2B] text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#B55D24]"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={saveToLibrary}
                    disabled={saving}
                    className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Library
                  </button>
                  <button
                    onClick={generateImage}
                    disabled={loading}
                    className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Prompt Used */}
            {promptUsed && (
              <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/70 text-sm font-medium">Prompt Used</h3>
                  <button
                    onClick={copyPrompt}
                    className="text-white/40 hover:text-white text-sm flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{promptUsed}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
