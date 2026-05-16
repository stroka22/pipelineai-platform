'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  ArrowLeft,
  Layers,
  Plus,
  Loader2,
  Sparkles,
  RefreshCw,
  Download,
  Save,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Building2,
  GripVertical
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CAROUSEL_CATEGORIES = [
  { id: 'myths_reality', name: 'Myths vs Reality', description: 'Debunk common misconceptions' },
  { id: 'mistakes', name: 'Common Mistakes', description: 'What to avoid' },
  { id: 'tips', name: 'Pro Tips', description: 'Expert advice' },
  { id: 'process', name: 'Process Explainer', description: 'Step-by-step guide' },
  { id: 'educational', name: 'Educational', description: 'Teach your audience' },
  { id: 'transformation', name: 'Transformation', description: 'Before & after stories' },
  { id: 'statistics', name: 'Statistics', description: 'Data-driven content' },
  { id: 'faq', name: 'FAQ', description: 'Answer common questions' },
  { id: 'authority', name: 'Authority Building', description: 'Establish expertise' },
  { id: 'lead_gen', name: 'Lead Generation', description: 'Drive conversions' },
];

const SLIDE_COUNTS = [5, 7, 10];

const NICHES = [
  'Roofing', 'HVAC', 'Plumbing', 'Pest Control', 'Med Spa', 'Dental', 'Chiropractic',
  'Real Estate', 'Mortgage', 'Insurance', 'Law Firm', 'Auto Repair', 'Landscaping',
  'Gym/Fitness', 'Salon', 'Restaurant', 'Church', 'Financial Planning', 'General'
];

interface Slide {
  id: string;
  slideNumber: number;
  headline: string;
  bodyText: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

export default function CarouselCreatorPage() {
  const [step, setStep] = useState<'setup' | 'generate' | 'review'>('setup');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Brands
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  
  // Setup
  const [carouselConfig, setCarouselConfig] = useState({
    title: '',
    category: 'tips',
    slideCount: 5,
    niche: 'General',
    businessName: '',
    topic: '',
    style: 'modern',
    primaryColor: '#C96A2B',
    secondaryColor: '#081F33',
  });
  
  // Slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    const { data } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('is_archived', false);
    
    setBrands(data || []);
  }

  function applyBrand(brandId: string) {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setCarouselConfig(prev => ({
        ...prev,
        businessName: brand.business_name,
        niche: brand.niche || prev.niche,
        primaryColor: brand.primary_color || prev.primaryColor,
        secondaryColor: brand.secondary_color || prev.secondaryColor,
      }));
    }
    setSelectedBrand(brandId);
  }

  function initializeSlides() {
    const newSlides: Slide[] = [];
    for (let i = 0; i < carouselConfig.slideCount; i++) {
      newSlides.push({
        id: `slide-${i}`,
        slideNumber: i + 1,
        headline: '',
        bodyText: '',
        imageUrl: null,
        status: 'pending',
      });
    }
    setSlides(newSlides);
    setStep('generate');
  }

  async function generateAllSlides() {
    setLoading(true);
    
    const category = CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category);
    
    for (let i = 0; i < slides.length; i++) {
      setGeneratingSlideIndex(i);
      setActiveSlideIndex(i);
      
      // Update status
      setSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));
      
      try {
        // Build prompt for this slide
        const slidePosition = i === 0 ? 'opening hook slide' : 
                             i === slides.length - 1 ? 'closing CTA slide' :
                             `slide ${i + 1} of ${slides.length}`;
        
        const prompt = `Create a premium ${carouselConfig.style} style carousel slide for a ${carouselConfig.niche.toLowerCase()} business.

This is ${slidePosition} in a ${carouselConfig.slideCount}-slide ${category?.name} carousel.
${carouselConfig.businessName ? `Business: "${carouselConfig.businessName}"` : ''}
Topic: ${carouselConfig.topic || category?.description}

${i === 0 ? 'This is the HOOK slide - it should grab attention and make people want to swipe.' : ''}
${i === slides.length - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

Color scheme: primary ${carouselConfig.primaryColor}, secondary ${carouselConfig.secondaryColor}.
The slide should be visually distinct from other slides while maintaining brand consistency.
Include readable text that fits the slide position in the carousel narrative.
Optimize for Instagram/social media square format.`;

        const response = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, size: '1024x1024' }),
        });
        
        const data = await response.json();
        
        if (data.success && data.imageUrl) {
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, imageUrl: data.imageUrl, status: 'complete' } : s
          ));
        } else {
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
        }
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        setSlides(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error' } : s
        ));
      }
    }
    
    setGeneratingSlideIndex(null);
    setLoading(false);
    setStep('review');
  }

  async function regenerateSlide(index: number) {
    setGeneratingSlideIndex(index);
    setSlides(prev => prev.map((s, idx) => 
      idx === index ? { ...s, status: 'generating' } : s
    ));
    
    const category = CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category);
    const slidePosition = index === 0 ? 'opening hook slide' : 
                         index === slides.length - 1 ? 'closing CTA slide' :
                         `slide ${index + 1} of ${slides.length}`;
    
    const prompt = `Create a premium ${carouselConfig.style} style carousel slide for a ${carouselConfig.niche.toLowerCase()} business.

This is ${slidePosition} in a ${carouselConfig.slideCount}-slide ${category?.name} carousel.
${carouselConfig.businessName ? `Business: "${carouselConfig.businessName}"` : ''}
Topic: ${carouselConfig.topic || category?.description}

${index === 0 ? 'This is the HOOK slide - grab attention and make people want to swipe.' : ''}
${index === slides.length - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

Color scheme: primary ${carouselConfig.primaryColor}, secondary ${carouselConfig.secondaryColor}.
Create a DIFFERENT visual composition than the previous version while maintaining brand consistency.`;

    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      });
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setSlides(prev => prev.map((s, idx) => 
          idx === index ? { ...s, imageUrl: data.imageUrl, status: 'complete' } : s
        ));
      } else {
        setSlides(prev => prev.map((s, idx) => 
          idx === index ? { ...s, status: 'error' } : s
        ));
      }
    } catch {
      setSlides(prev => prev.map((s, idx) => 
        idx === index ? { ...s, status: 'error' } : s
      ));
    }
    
    setGeneratingSlideIndex(null);
  }

  async function saveCarousel() {
    setSaving(true);
    
    try {
      // Create carousel project
      const { data: carousel, error: carouselError } = await supabase
        .from('carousel_projects')
        .insert({
          title: carouselConfig.title || `${carouselConfig.niche} - ${CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category)?.name}`,
          brand_profile_id: selectedBrand || null,
          slide_count: carouselConfig.slideCount,
          category: carouselConfig.category,
          niche: carouselConfig.niche,
          style_preset: carouselConfig.style,
          status: 'complete',
        })
        .select()
        .single();
      
      if (carouselError) throw carouselError;
      
      // Create slides
      for (const slide of slides) {
        if (slide.imageUrl) {
          // Save image first
          const { data: image } = await supabase
            .from('generated_images')
            .insert({
              image_url: slide.imageUrl,
              prompt_used: `Carousel slide ${slide.slideNumber}`,
              brand_profile_id: selectedBrand || null,
              content_type: 'Carousel Slide',
              niche: carouselConfig.niche,
              style: carouselConfig.style,
              title: `${carouselConfig.title || 'Carousel'} - Slide ${slide.slideNumber}`,
            })
            .select()
            .single();
          
          // Create slide record
          await supabase
            .from('carousel_slides')
            .insert({
              carousel_project_id: carousel.id,
              generated_image_id: image?.id,
              slide_number: slide.slideNumber,
              headline: slide.headline,
              body_text: slide.bodyText,
              image_url: slide.imageUrl,
              status: 'complete',
            });
        }
      }
      
      alert('Carousel saved to library!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save carousel');
    } finally {
      setSaving(false);
    }
  }

  async function downloadAllSlides() {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.imageUrl) {
        try {
          if (slide.imageUrl.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = slide.imageUrl;
            a.download = `carousel-slide-${i + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const response = await fetch(slide.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carousel-slide-${i + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.error(`Failed to download slide ${i + 1}`);
        }
      }
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
                <Layers className="w-5 h-5 text-purple-500" />
                Carousel Creator
              </h1>
            </div>
            
            {step === 'review' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadAllSlides}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
                <button
                  onClick={saveCarousel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C96A2B] text-white rounded-lg hover:bg-[#B55D24]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Library
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {step === 'setup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create New Carousel</h2>
              <p className="text-white/60">Configure your carousel settings</p>
            </div>

            {/* Brand Selection */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Brand Profile (optional)
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => applyBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="">No brand selected</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Basic Info */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="text-white font-semibold">Carousel Info</h3>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={carouselConfig.title}
                  onChange={(e) => setCarouselConfig({...carouselConfig, title: e.target.value})}
                  placeholder="e.g., 5 Roofing Myths Debunked"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={carouselConfig.businessName}
                    onChange={(e) => setCarouselConfig({...carouselConfig, businessName: e.target.value})}
                    placeholder="e.g., ABC Roofing"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Niche</label>
                  <select
                    value={carouselConfig.niche}
                    onChange={(e) => setCarouselConfig({...carouselConfig, niche: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {NICHES.map(niche => (
                      <option key={niche} value={niche}>{niche}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Topic/Subject</label>
                <input
                  type="text"
                  value={carouselConfig.topic}
                  onChange={(e) => setCarouselConfig({...carouselConfig, topic: e.target.value})}
                  placeholder="e.g., Signs your roof needs replacement"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Carousel Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CAROUSEL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCarouselConfig({...carouselConfig, category: cat.id})}
                    className={`p-3 rounded-lg text-left transition-all ${
                      carouselConfig.category === cat.id 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{cat.name}</p>
                    <p className="text-white/50 text-xs">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Number of Slides</label>
              <div className="flex gap-2">
                {SLIDE_COUNTS.map(count => (
                  <button
                    key={count}
                    onClick={() => setCarouselConfig({...carouselConfig, slideCount: count})}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      carouselConfig.slideCount === count 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {count} Slides
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Brand Colors</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Primary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={carouselConfig.primaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, primaryColor: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={carouselConfig.primaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, primaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Secondary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={carouselConfig.secondaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, secondaryColor: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={carouselConfig.secondaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, secondaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={initializeSlides}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate {carouselConfig.slideCount}-Slide Carousel
            </button>
          </div>
        )}

        {(step === 'generate' || step === 'review') && (
          <div className="space-y-6">
            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeSlideIndex === index 
                      ? 'border-purple-500' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      {slide.status === 'generating' ? (
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      ) : (
                        <span className="text-white/40 text-xs">{index + 1}</span>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-0.5">
                    <span className="text-white text-xs">{index + 1}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Slide View */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Slide {activeSlideIndex + 1} of {slides.length}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                    disabled={activeSlideIndex === 0}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                    disabled={activeSlideIndex === slides.length - 1}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="aspect-square max-w-lg mx-auto bg-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                {slides[activeSlideIndex]?.status === 'generating' ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Generating slide {activeSlideIndex + 1}...</p>
                  </div>
                ) : slides[activeSlideIndex]?.imageUrl ? (
                  <img
                    src={slides[activeSlideIndex].imageUrl}
                    alt={`Slide ${activeSlideIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white/40">
                    <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Slide will appear here</p>
                  </div>
                )}
              </div>
              
              {step === 'review' && slides[activeSlideIndex]?.imageUrl && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => regenerateSlide(activeSlideIndex)}
                    disabled={generatingSlideIndex !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50"
                  >
                    {generatingSlideIndex === activeSlideIndex ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Regenerate Slide
                  </button>
                </div>
              )}
            </div>

            {/* Generate All Button */}
            {step === 'generate' && !loading && slides.every(s => s.status === 'pending') && (
              <button
                onClick={generateAllSlides}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate All {slides.length} Slides
              </button>
            )}
            
            {loading && (
              <div className="text-center py-4">
                <p className="text-white/60">
                  Generating slide {(generatingSlideIndex ?? 0) + 1} of {slides.length}...
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${((generatingSlideIndex ?? 0) + 1) / slides.length * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
