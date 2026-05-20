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
  Plus,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  type: 'logo' | 'headshot' | 'reference';
}

interface GeneratedSlide {
  id: string;
  slideNumber: number;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

interface BrandAnalysis {
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
  logoDescription: string;
  styleNotes: string;
}

export default function ProCreatePage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [step, setStep] = useState<'input' | 'review' | 'generating' | 'complete'>('input');
  
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null);
  const [carouselStrategy, setCarouselStrategy] = useState<any>(null);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        
        // Auto-detect type based on filename or let user change it
        let type: 'logo' | 'headshot' | 'reference' = 'reference';
        const name = file.name.toLowerCase();
        if (name.includes('logo')) type = 'logo';
        else if (name.includes('headshot') || name.includes('portrait') || name.includes('photo')) type = 'headshot';
        
        // If we don't have a logo yet, first image might be logo
        const hasLogo = images.some(img => img.type === 'logo');
        const hasHeadshot = images.some(img => img.type === 'headshot');
        
        if (!hasLogo && images.length === 0) type = 'logo';
        else if (!hasHeadshot && images.length === 1) type = 'headshot';
        
        setImages(prev => [...prev, {
          id: crypto.randomUUID(),
          file,
          preview,
          name: file.name,
          type,
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateImageType = (id: string, type: 'logo' | 'headshot' | 'reference') => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, type } : img
    ));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const analyzeAndGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt describing what you want to create');
      return;
    }

    const logo = images.find(img => img.type === 'logo');
    const headshot = images.find(img => img.type === 'headshot');

    if (!logo || !headshot) {
      alert('Please upload at least a logo and a headshot');
      return;
    }

    setLoading(true);
    setStep('review');

    try {
      // Step 1: Analyze images and generate strategy
      setProgress('Analyzing your brand assets...');
      
      const imageData = images.map(img => ({
        data: img.preview,
        type: img.type,
        name: img.name,
      }));

      const response = await fetch('/api/studio/pro-create/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: imageData,
          slideCount,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setBrandAnalysis(data.brandAnalysis);
      setCarouselStrategy(data.carouselStrategy);
      setProgress('');
      setLoading(false);

    } catch (error: any) {
      console.error('Analysis error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
      setStep('input');
    }
  };

  const generateSlides = async () => {
    if (!brandAnalysis || !carouselStrategy) return;

    setLoading(true);
    setStep('generating');

    const logo = images.find(img => img.type === 'logo');
    const headshot = images.find(img => img.type === 'headshot');

    // Initialize slides
    const initialSlides: GeneratedSlide[] = carouselStrategy.slides.map((_: any, i: number) => ({
      id: crypto.randomUUID(),
      slideNumber: i + 1,
      imageUrl: null,
      status: 'pending' as const,
    }));
    setGeneratedSlides(initialSlides);

    // Generate each slide
    for (let i = 0; i < carouselStrategy.slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} of ${carouselStrategy.slides.length}...`);
      
      setGeneratedSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));

      try {
        const slideStrategy = carouselStrategy.slides[i];
        
        const response = await fetch('/api/studio/pro-create/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slideNumber: i + 1,
            totalSlides: carouselStrategy.slides.length,
            brandAnalysis,
            slideStrategy,
            logo: logo?.preview,
            headshot: headshot?.preview,
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
    setStep('complete');
  };

  const downloadAll = () => {
    generatedSlides.forEach((slide, index) => {
      if (slide.imageUrl) {
        const link = document.createElement('a');
        link.href = slide.imageUrl;
        link.download = `${brandAnalysis?.companyName?.replace(/\s+/g, '-') || 'carousel'}-slide-${index + 1}.png`;
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
          const response = await fetch(slide.imageUrl);
          const blob = await response.blob();
          const fileName = `pro-create-${Date.now()}-slide-${slide.slideNumber}.png`;
          
          const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, blob, { contentType: 'image/png' });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

          await supabase.from('generated_images').insert({
            title: `${brandAnalysis?.companyName || 'Pro Create'} - Slide ${slide.slideNumber}`,
            image_url: publicUrl,
            prompt_used: prompt,
            niche: brandAnalysis?.industry || 'General',
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

  const startOver = () => {
    setStep('input');
    setGeneratedSlides([]);
    setBrandAnalysis(null);
    setCarouselStrategy(null);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/studio" className="text-white/60 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Pro Create
            </h1>
            <p className="text-white/50 text-sm">Upload images + simple prompt = professional branded carousels</p>
          </div>
        </div>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="space-y-6">
            {/* Simple Prompt */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Contact Info & Context <span className="text-white/40">(paste or type)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Craig Pitts (513) 264-3318 craigp@sbacfunding.com sbacfunding.com - 15 years helping businesses get the funds they need"
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
              <p className="text-white/30 text-xs mt-1">AI extracts company name, colors & style from your logo automatically</p>
            </div>

            {/* Slide count */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white/70">Slides:</label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                {[3, 5, 7, 10].map(n => (
                  <option key={n} value={n} className="bg-gray-900">{n}</option>
                ))}
              </select>
            </div>

            {/* Image uploads */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white/70">
                  Upload Images (logo, headshot, references)
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Images
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50">Click to upload logo and headshot</p>
                  <p className="text-white/30 text-sm mt-1">First image = Logo, Second = Headshot (you can change)</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square relative rounded-xl overflow-hidden border-2 border-white/10">
                        <Image src={img.preview} alt={img.name} fill className="object-cover" />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={img.type}
                        onChange={(e) => updateImageType(img.id, e.target.value as any)}
                        className="mt-2 w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="logo" className="bg-gray-900">Logo</option>
                        <option value="headshot" className="bg-gray-900">Headshot</option>
                        <option value="reference" className="bg-gray-900">Reference</option>
                      </select>
                    </div>
                  ))}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-500/50"
                  >
                    <Plus className="w-8 h-8 text-white/30" />
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={analyzeAndGenerate}
              disabled={loading || !prompt.trim() || images.length < 2}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progress}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze & Create Strategy
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Review Strategy */}
        {step === 'review' && brandAnalysis && carouselStrategy && (
          <div className="space-y-6">
            {/* Brand Analysis */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Brand Analysis
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Company:</span>{' '}
                  <span className="text-white">{brandAnalysis.companyName}</span>
                </div>
                <div>
                  <span className="text-white/50">Person:</span>{' '}
                  <span className="text-white">{brandAnalysis.personName}</span>
                </div>
                <div>
                  <span className="text-white/50">Title:</span>{' '}
                  <span className="text-white">{brandAnalysis.title}</span>
                </div>
                <div>
                  <span className="text-white/50">Industry:</span>{' '}
                  <span className="text-white">{brandAnalysis.industry}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-white/50">Colors:</span>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: brandAnalysis.primaryColor }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: brandAnalysis.secondaryColor }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: brandAnalysis.accentColor }} />
                </div>
              </div>
            </div>

            {/* Carousel Strategy */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Carousel Strategy</h2>
              <p className="text-white/60 mb-4">{carouselStrategy.overview}</p>
              
              <div className="space-y-3">
                {carouselStrategy.slides.map((slide: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">
                        Slide {i + 1}
                      </span>
                      {slide.includeHeadshot && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">Headshot</span>
                      )}
                      {slide.includeLogo && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">Logo</span>
                      )}
                    </div>
                    <h3 className="text-white font-bold">{slide.headline}</h3>
                    <p className="text-white/50 text-sm">{slide.bodyText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={startOver}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Start Over
              </button>
              <button
                onClick={generateSlides}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Slides
              </button>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Generating & Complete */}
        {(step === 'generating' || step === 'complete') && (
          <div className="space-y-6">
            {loading && (
              <div className="text-center py-4">
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

            {step === 'complete' && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={startOver}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Create Another
                </button>
                <button
                  onClick={downloadAll}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download All
                </button>
                <button
                  onClick={saveToLibrary}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2"
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
