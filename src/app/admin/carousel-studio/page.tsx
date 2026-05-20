'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  X, 
  Loader2, 
  Download,
  Save,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileImage,
  Type,
  Palette,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BrandProfile, SlideData, CarouselStrategy } from '@/lib/carousel-templates/types';

interface RenderedSlide extends SlideData {
  renderedImageUrl?: string;
  backgroundUrl?: string;
  status: 'pending' | 'generating-bg' | 'rendering' | 'complete' | 'error';
  error?: string;
}

export default function CarouselStudioPage() {
  // Brand Profile
  const [brandProfile, setBrandProfile] = useState<Partial<BrandProfile>>({
    company_name: '',
    person_name: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    primary_color: '#1e3a5f',
    secondary_color: '#4a7c4e',
    accent_color: '#c9a227',
    industry: '',
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [headshotPreview, setHeadshotPreview] = useState<string>('');
  
  // Carousel Settings
  const [slideCount, setSlideCount] = useState(5);
  const [topic, setTopic] = useState('');
  const [layoutFamily, setLayoutFamily] = useState('corporate-authority');
  
  // Generation State
  const [step, setStep] = useState<'brand' | 'generate' | 'edit' | 'export'>('brand');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [strategy, setStrategy] = useState<CarouselStrategy | null>(null);
  const [slides, setSlides] = useState<RenderedSlide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [qualityScore, setQualityScore] = useState<{ score: number; issues: string[] } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const headshotInputRef = useRef<HTMLInputElement>(null);

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'headshot') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setLogoPreview(result);
        setBrandProfile(prev => ({ ...prev, logo_url: result }));
      } else {
        setHeadshotPreview(result);
        setBrandProfile(prev => ({ ...prev, headshot_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate strategy
  const generateStrategy = async () => {
    if (!brandProfile.company_name) {
      alert('Please enter a company name');
      return;
    }

    setLoading(true);
    setProgress('Generating carousel strategy...');

    try {
      const response = await fetch('/api/carousel/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: {
            ...brandProfile,
            logo_url: logoPreview,
            headshot_url: headshotPreview,
          },
          slideCount,
          topic,
          layoutFamily,
        }),
      });

      const data = await response.json();

      if (data.success && data.strategy) {
        setStrategy(data.strategy);
        
        // Initialize slides with strategy data
        const initialSlides: RenderedSlide[] = data.strategy.slides.map((slide: SlideData) => ({
          ...slide,
          status: 'pending' as const,
          backgroundUrl: undefined,
          renderedImageUrl: undefined,
        }));
        setSlides(initialSlides);
        setStep('edit');
      } else {
        throw new Error(data.error || 'Failed to generate strategy');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  // Generate background for a single slide
  const generateBackground = async (slideIndex: number) => {
    const slide = slides[slideIndex];
    if (!slide.backgroundPrompt) return;

    setSlides(prev => prev.map((s, i) => 
      i === slideIndex ? { ...s, status: 'generating-bg' } : s
    ));

    try {
      const response = await fetch('/api/carousel/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: slide.backgroundPrompt,
          style: layoutFamily,
          niche: brandProfile.industry,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setSlides(prev => prev.map((s, i) => 
          i === slideIndex ? { ...s, backgroundUrl: data.imageUrl, status: 'pending' } : s
        ));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setSlides(prev => prev.map((s, i) => 
        i === slideIndex ? { ...s, status: 'error', error: error.message } : s
      ));
    }
  };

  // Render a single slide to PNG
  const renderSlide = async (slideIndex: number) => {
    const slide = slides[slideIndex];
    
    setSlides(prev => prev.map((s, i) => 
      i === slideIndex ? { ...s, status: 'rendering' } : s
    ));

    try {
      const response = await fetch('/api/carousel/render-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide,
          brand: {
            ...brandProfile,
            logo_url: logoPreview,
            headshot_url: headshotPreview,
          },
          layoutFamily,
          backgroundUrl: slide.backgroundUrl,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setSlides(prev => prev.map((s, i) => 
          i === slideIndex ? { ...s, renderedImageUrl: data.imageUrl, status: 'complete' } : s
        ));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setSlides(prev => prev.map((s, i) => 
        i === slideIndex ? { ...s, status: 'error', error: error.message } : s
      ));
    }
  };

  // Generate all backgrounds and render all slides
  const generateAll = async () => {
    setLoading(true);
    
    for (let i = 0; i < slides.length; i++) {
      setProgress(`Generating background ${i + 1}/${slides.length}...`);
      
      // Generate background
      await generateBackground(i);
      
      // Wait a moment for state to update
      await new Promise(r => setTimeout(r, 500));
    }

    for (let i = 0; i < slides.length; i++) {
      setProgress(`Rendering slide ${i + 1}/${slides.length}...`);
      
      // Render slide
      await renderSlide(i);
      
      await new Promise(r => setTimeout(r, 500));
    }

    setProgress('');
    setLoading(false);
    setStep('export');
  };

  // Export as ZIP
  const exportZip = async () => {
    setLoading(true);
    setProgress('Creating ZIP file...');

    try {
      const response = await fetch('/api/carousel/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides.map(s => ({
            slideNumber: s.slideNumber,
            imageUrl: s.renderedImageUrl,
          })),
          projectName: brandProfile.company_name?.replace(/\s+/g, '-').toLowerCase() || 'carousel',
        }),
      });

      const data = await response.json();

      if (data.success && data.zipData) {
        // Download ZIP
        const link = document.createElement('a');
        link.href = `data:application/zip;base64,${data.zipData}`;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  // Update slide content
  const updateSlide = (index: number, updates: Partial<SlideData>) => {
    setSlides(prev => prev.map((s, i) => 
      i === index ? { ...s, ...updates, status: 'pending', renderedImageUrl: undefined } : s
    ));
  };

  // Current slide
  const currentSlide = slides[selectedSlide];

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/studio" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-400" />
                Carousel Studio
              </h1>
              <p className="text-white/50 text-sm">AI-powered carousel generation with deterministic rendering</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {['brand', 'generate', 'edit', 'export'].map((s, i) => (
              <div key={s} className={`flex items-center ${i > 0 ? 'ml-2' : ''}`}>
                {i > 0 && <div className={`w-8 h-0.5 ${step === s || ['generate', 'edit', 'export'].indexOf(step) >= ['generate', 'edit', 'export'].indexOf(s) ? 'bg-blue-500' : 'bg-white/20'}`} />}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-blue-500 text-white' : 
                  ['brand', 'generate', 'edit', 'export'].indexOf(step) > ['brand', 'generate', 'edit', 'export'].indexOf(s) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40'
                }`}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Brand Profile */}
        {step === 'brand' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Brand Information
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm text-white/60">Company Name *</label>
                    <input
                      type="text"
                      value={brandProfile.company_name}
                      onChange={e => setBrandProfile(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="Acme Corporation"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Your Name</label>
                    <input
                      type="text"
                      value={brandProfile.person_name}
                      onChange={e => setBrandProfile(prev => ({ ...prev, person_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Title</label>
                    <input
                      type="text"
                      value={brandProfile.title}
                      onChange={e => setBrandProfile(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="CEO & Founder"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60">Phone</label>
                    <input
                      type="text"
                      value={brandProfile.phone}
                      onChange={e => setBrandProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Email</label>
                    <input
                      type="text"
                      value={brandProfile.email}
                      onChange={e => setBrandProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="john@acme.com"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm text-white/60">Website</label>
                    <input
                      type="text"
                      value={brandProfile.website}
                      onChange={e => setBrandProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="www.acme.com"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm text-white/60">Industry</label>
                    <input
                      type="text"
                      value={brandProfile.industry}
                      onChange={e => setBrandProfile(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      placeholder="Business Consulting"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Brand Colors
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Primary</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={brandProfile.primary_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandProfile.primary_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Secondary</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={brandProfile.secondary_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandProfile.secondary_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60">Accent</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={brandProfile.accent_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, accent_color: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandProfile.accent_color}
                        onChange={e => setBrandProfile(prev => ({ ...prev, accent_color: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Logo & Headshot */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-green-400" />
                  Brand Assets
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Logo</label>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="hidden" />
                    {logoPreview ? (
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        <Image src={logoPreview} alt="Logo" fill className="object-contain p-4" />
                        <button
                          onClick={() => { setLogoPreview(''); setBrandProfile(prev => ({ ...prev, logo_url: '' })); }}
                          className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-blue-500/50"
                      >
                        <Upload className="w-8 h-8 text-white/30 mb-2" />
                        <span className="text-white/40 text-sm">Upload Logo</span>
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Headshot</label>
                    <input ref={headshotInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'headshot')} className="hidden" />
                    {headshotPreview ? (
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        <Image src={headshotPreview} alt="Headshot" fill className="object-cover" />
                        <button
                          onClick={() => { setHeadshotPreview(''); setBrandProfile(prev => ({ ...prev, headshot_url: '' })); }}
                          className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => headshotInputRef.current?.click()}
                        className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-blue-500/50"
                      >
                        <User className="w-8 h-8 text-white/30 mb-2" />
                        <span className="text-white/40 text-sm">Upload Headshot</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Carousel Settings */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  Carousel Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60">Topic / Focus</label>
                    <textarea
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1 h-20 resize-none"
                      placeholder="What should this carousel be about? e.g., '5 reasons to work with us' or 'Our funding process explained'"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60">Number of Slides</label>
                      <select
                        value={slideCount}
                        onChange={e => setSlideCount(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      >
                        {[3, 5, 7, 10].map(n => (
                          <option key={n} value={n} className="bg-gray-900">{n} Slides</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-white/60">Layout Family</label>
                      <select
                        value={layoutFamily}
                        onChange={e => setLayoutFamily(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 mt-1"
                      >
                        <option value="corporate-authority" className="bg-gray-900">Corporate Authority</option>
                        <option value="modern-minimal" className="bg-gray-900">Modern Minimal</option>
                        <option value="bold-impact" className="bg-gray-900">Bold Impact</option>
                        <option value="premium-financial" className="bg-gray-900">Premium Financial</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateStrategy}
                disabled={loading || !brandProfile.company_name}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Carousel Strategy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2/3: Edit Slides */}
        {(step === 'edit' || step === 'export') && slides.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slide Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Slide {selectedSlide + 1} of {slides.length}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSlide(Math.max(0, selectedSlide - 1))}
                      disabled={selectedSlide === 0}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1))}
                      disabled={selectedSlide === slides.length - 1}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="aspect-square bg-white/5 rounded-lg overflow-hidden relative">
                  {currentSlide?.renderedImageUrl ? (
                    <Image 
                      src={currentSlide.renderedImageUrl} 
                      alt={`Slide ${selectedSlide + 1}`}
                      fill
                      className="object-contain"
                    />
                  ) : currentSlide?.backgroundUrl ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={currentSlide.backgroundUrl} 
                        alt="Background"
                        fill
                        className="object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold">{currentSlide.headline}</div>
                          <div className="text-sm text-white/60 mt-2">Background generated - click Render to preview</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-xl font-bold mb-2">{currentSlide?.headline}</div>
                        <div className="text-sm text-white/40">No preview yet</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status overlay */}
                  {currentSlide?.status === 'generating-bg' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                      <span className="ml-3">Generating background...</span>
                    </div>
                  )}
                  {currentSlide?.status === 'rendering' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                      <span className="ml-3">Rendering slide...</span>
                    </div>
                  )}
                </div>

                {/* Slide thumbnails */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      onClick={() => setSelectedSlide(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 relative overflow-hidden ${
                        i === selectedSlide ? 'border-blue-500' : 'border-white/10'
                      }`}
                    >
                      {slide.renderedImageUrl ? (
                        <Image src={slide.renderedImageUrl} alt="" fill className="object-cover" />
                      ) : slide.backgroundUrl ? (
                        <Image src={slide.backgroundUrl} alt="" fill className="object-cover opacity-50" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-lg font-bold text-white/30">
                          {i + 1}
                        </div>
                      )}
                      {slide.status === 'complete' && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      {slide.status === 'error' && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => generateBackground(selectedSlide)}
                  disabled={loading || currentSlide?.status === 'generating-bg'}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {currentSlide?.backgroundUrl ? 'Regenerate BG' : 'Generate BG'}
                </button>
                <button
                  onClick={() => renderSlide(selectedSlide)}
                  disabled={loading || currentSlide?.status === 'rendering'}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <FileImage className="w-4 h-4" />
                  Render Slide
                </button>
              </div>
              
              <button
                onClick={generateAll}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate All Slides
                  </>
                )}
              </button>

              {step === 'export' && (
                <button
                  onClick={exportZip}
                  disabled={loading || !slides.every(s => s.renderedImageUrl)}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download ZIP
                </button>
              )}
            </div>

            {/* Slide Editor */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-400" />
                  Edit Content
                </h3>

                {currentSlide && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/60">Headline</label>
                      <input
                        type="text"
                        value={currentSlide.headline}
                        onChange={e => updateSlide(selectedSlide, { headline: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-white/60">Subheadline</label>
                      <input
                        type="text"
                        value={currentSlide.subheadline || ''}
                        onChange={e => updateSlide(selectedSlide, { subheadline: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-white/60">Body Text</label>
                      <textarea
                        value={currentSlide.bodyText || ''}
                        onChange={e => updateSlide(selectedSlide, { bodyText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm h-20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/60">CTA</label>
                      <input
                        type="text"
                        value={currentSlide.cta || ''}
                        onChange={e => updateSlide(selectedSlide, { cta: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/60">Background Prompt</label>
                      <textarea
                        value={currentSlide.backgroundPrompt || ''}
                        onChange={e => updateSlide(selectedSlide, { backgroundPrompt: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm h-24 resize-none font-mono"
                      />
                    </div>

                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentSlide.includeLogo}
                          onChange={e => updateSlide(selectedSlide, { includeLogo: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Logo
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentSlide.includeHeadshot}
                          onChange={e => updateSlide(selectedSlide, { includeHeadshot: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Headshot
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentSlide.includeContactBar}
                          onChange={e => updateSlide(selectedSlide, { includeContactBar: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Contact
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategy Overview */}
              {strategy && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Strategy</h3>
                  <p className="text-sm text-white/60">{strategy.overview}</p>
                  <p className="text-xs text-white/40 mt-2">Target: {strategy.targetAudience}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
