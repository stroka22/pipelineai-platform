'use client';

import { useState, useRef } from 'react';
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
  ImageIcon,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  Palette,
  Briefcase,
  FileText,
  ChevronRight,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BrandAssets {
  logo: string | null;
  headshot: string | null;
  companyName: string;
  personName: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  industry: string;
  topic: string;
  slideCount: number;
}

interface GeneratedSlide {
  id: string;
  slideNumber: number;
  imageUrl: string | null;
  headline: string;
  subheadline: string;
  bodyText: string;
  cta: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

interface CarouselStrategy {
  overview: string;
  slides: {
    headline: string;
    subheadline: string;
    bodyText: string;
    cta: string;
    visualDirection: string;
    includeHeadshot: boolean;
    includeLogo: boolean;
  }[];
}

export default function ProCreatePage() {
  const [step, setStep] = useState<'assets' | 'strategy' | 'generate' | 'review'>('assets');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  
  const [assets, setAssets] = useState<BrandAssets>({
    logo: null,
    headshot: null,
    companyName: '',
    personName: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    primaryColor: '#1e3a5f',
    secondaryColor: '#4a7c4e',
    accentColor: '#c9a227',
    industry: '',
    topic: '',
    slideCount: 5,
  });

  const [strategy, setStrategy] = useState<CarouselStrategy | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headshotInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'headshot') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAssets(prev => ({ ...prev, [type]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const generateStrategy = async () => {
    if (!assets.companyName || !assets.personName || !assets.industry) {
      alert('Please fill in company name, person name, and industry');
      return;
    }

    setLoading(true);
    setProgress('Generating carousel strategy...');

    try {
      const response = await fetch('/api/studio/pro-create/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets,
          slideCount: assets.slideCount,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate strategy');
      }

      setStrategy(data.strategy);
      setStep('strategy');
    } catch (error: any) {
      console.error('Strategy error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const generateSlides = async () => {
    if (!strategy) return;

    setLoading(true);
    setStep('generate');

    // Initialize slides
    const initialSlides: GeneratedSlide[] = strategy.slides.map((s, i) => ({
      id: crypto.randomUUID(),
      slideNumber: i + 1,
      imageUrl: null,
      headline: s.headline,
      subheadline: s.subheadline,
      bodyText: s.bodyText,
      cta: s.cta,
      status: 'pending',
    }));
    setGeneratedSlides(initialSlides);

    // Generate each slide
    for (let i = 0; i < strategy.slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} of ${strategy.slides.length}...`);
      
      // Update status to generating
      setGeneratedSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));

      try {
        const slideStrategy = strategy.slides[i];
        
        const response = await fetch('/api/studio/pro-create/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slideNumber: i + 1,
            totalSlides: strategy.slides.length,
            assets,
            slideStrategy,
          })
        });

        const data = await response.json();

        if (data.success && data.imageUrl) {
          setGeneratedSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, imageUrl: data.imageUrl, status: 'complete' } : s
          ));
        } else {
          throw new Error(data.error || 'Render failed');
        }
      } catch (error: any) {
        console.error(`Slide ${i + 1} error:`, error);
        setGeneratedSlides(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error' } : s
        ));
      }
    }

    setLoading(false);
    setProgress('');
    setStep('review');
  };

  const downloadAll = () => {
    generatedSlides.forEach((slide, index) => {
      if (slide.imageUrl) {
        const link = document.createElement('a');
        link.href = slide.imageUrl;
        link.download = `${assets.companyName.replace(/\s+/g, '-')}-slide-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const saveToLibrary = async () => {
    setLoading(true);
    try {
      for (const slide of generatedSlides) {
        if (slide.imageUrl) {
          // Upload to Supabase storage
          const response = await fetch(slide.imageUrl);
          const blob = await response.blob();
          const fileName = `pro-create-${Date.now()}-slide-${slide.slideNumber}.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, blob, { contentType: 'image/png' });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

          // Save to database
          await supabase.from('generated_images').insert({
            title: `${assets.companyName} - Slide ${slide.slideNumber}`,
            image_url: publicUrl,
            prompt_used: `Pro Create: ${slide.headline}`,
            niche: assets.industry || 'General',
            style: 'pro-create',
            content_type: 'carousel',
          });
        }
      }

      alert(`Saved ${generatedSlides.length} slides to library!`);
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/studio" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Pro Create
              </h1>
              <p className="text-white/50 text-sm">Professional carousels with real headshots & logos</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['assets', 'strategy', 'generate', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-amber-500 text-black' : 
                ['assets', 'strategy', 'generate', 'review'].indexOf(step) > i ? 'bg-green-500 text-white' : 
                'bg-white/10 text-white/50'
              }`}>
                {['assets', 'strategy', 'generate', 'review'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm capitalize ${step === s ? 'text-amber-400' : 'text-white/50'}`}>
                {s === 'assets' ? 'Brand Assets' : s}
              </span>
              {i < 3 && <ChevronRight className="w-4 h-4 text-white/30" />}
            </div>
          ))}
        </div>

        {/* Step 1: Brand Assets */}
        {step === 'assets' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Images */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Visual Assets
                </h2>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Company Logo</label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                  />
                  {assets.logo ? (
                    <div className="relative w-40 h-40 bg-white rounded-xl overflow-hidden">
                      <Image src={assets.logo} alt="Logo" fill className="object-contain p-2" />
                      <button
                        onClick={() => setAssets(prev => ({ ...prev, logo: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-40 h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors"
                    >
                      <Building2 className="w-8 h-8 text-white/30 mb-2" />
                      <span className="text-white/50 text-sm">Upload Logo</span>
                    </div>
                  )}
                </div>

                {/* Headshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Professional Headshot</label>
                  <input
                    ref={headshotInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'headshot')}
                    className="hidden"
                  />
                  {assets.headshot ? (
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden">
                      <Image src={assets.headshot} alt="Headshot" fill className="object-cover" />
                      <button
                        onClick={() => setAssets(prev => ({ ...prev, headshot: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => headshotInputRef.current?.click()}
                      className="w-40 h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors"
                    >
                      <User className="w-8 h-8 text-white/30 mb-2" />
                      <span className="text-white/50 text-sm">Upload Headshot</span>
                    </div>
                  )}
                </div>

                {/* Brand Colors */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Brand Colors
                  </label>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-xs text-white/50">Primary</label>
                      <input
                        type="color"
                        value={assets.primaryColor}
                        onChange={(e) => setAssets(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Secondary</label>
                      <input
                        type="color"
                        value={assets.secondaryColor}
                        onChange={(e) => setAssets(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Accent</label>
                      <input
                        type="color"
                        value={assets.accentColor}
                        onChange={(e) => setAssets(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Business Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-white/70 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={assets.companyName}
                      onChange={(e) => setAssets(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Small Business Assets & Capital"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Person Name *</label>
                    <input
                      type="text"
                      value={assets.personName}
                      onChange={(e) => setAssets(prev => ({ ...prev, personName: e.target.value }))}
                      placeholder="Craig Pitts"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Title</label>
                    <input
                      type="text"
                      value={assets.title}
                      onChange={(e) => setAssets(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Business Funding Advisor"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Phone
                    </label>
                    <input
                      type="text"
                      value={assets.phone}
                      onChange={(e) => setAssets(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(513) 264-3318"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="text"
                      value={assets.email}
                      onChange={(e) => setAssets(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="craig@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-white/70 mb-1">
                      <Globe className="w-3 h-3 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="text"
                      value={assets.website}
                      onChange={(e) => setAssets(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://sbacfunding.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      <Briefcase className="w-3 h-3 inline mr-1" />
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={assets.industry}
                      onChange={(e) => setAssets(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Business Financing"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Slides</label>
                    <select
                      value={assets.slideCount}
                      onChange={(e) => setAssets(prev => ({ ...prev, slideCount: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    >
                      {[3, 5, 7, 10].map(n => (
                        <option key={n} value={n} className="bg-gray-900">{n} slides</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-white/70 mb-1">Topic / Focus</label>
                    <textarea
                      value={assets.topic}
                      onChange={(e) => setAssets(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Business funding solutions for small business owners looking to grow, expand, or secure working capital..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Strategy Button */}
            <div className="mt-8 text-center">
              <button
                onClick={generateStrategy}
                disabled={loading || !assets.companyName || !assets.personName || !assets.industry}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto transition-all"
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

        {/* Step 2: Review Strategy */}
        {step === 'strategy' && strategy && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Carousel Strategy</h2>
              <p className="text-white/60">{strategy.overview}</p>
            </div>

            <div className="space-y-4">
              {strategy.slides.map((slide, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">
                          Slide {i + 1}
                        </span>
                        {slide.includeHeadshot && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">+ Headshot</span>
                        )}
                        {slide.includeLogo && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">+ Logo</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold">{slide.headline}</h3>
                      {slide.subheadline && <p className="text-amber-400 text-sm">{slide.subheadline}</p>}
                      <p className="text-white/60 text-sm mt-1">{slide.bodyText}</p>
                      {slide.cta && <p className="text-white/40 text-xs mt-2">CTA: {slide.cta}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setStep('assets')}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Back to Edit
              </button>
              <button
                onClick={generateSlides}
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generate Slides
              </button>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Generate & Review */}
        {(step === 'generate' || step === 'review') && (
          <div className="max-w-5xl mx-auto">
            {loading && (
              <div className="text-center mb-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
                <p className="text-white/60">{progress}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {generatedSlides.map((slide) => (
                <div key={slide.id} className="relative">
                  <div className={`aspect-square rounded-xl overflow-hidden border-2 ${
                    slide.status === 'complete' ? 'border-green-500' :
                    slide.status === 'generating' ? 'border-amber-500 animate-pulse' :
                    slide.status === 'error' ? 'border-red-500' :
                    'border-white/10'
                  }`}>
                    {slide.imageUrl ? (
                      <Image src={slide.imageUrl} alt={`Slide ${slide.slideNumber}`} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        {slide.status === 'generating' ? (
                          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                        ) : slide.status === 'error' ? (
                          <X className="w-8 h-8 text-red-400" />
                        ) : (
                          <span className="text-white/30 text-2xl font-bold">{slide.slideNumber}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {slide.slideNumber}/{generatedSlides.length}
                  </div>
                </div>
              ))}
            </div>

            {step === 'review' && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={downloadAll}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download All
                </button>
                <button
                  onClick={saveToLibrary}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save to Library
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
