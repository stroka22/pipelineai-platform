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
  Plus,
  Wand2,
  Copy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUrl } from '@/lib/storage';

interface UploadedImage {
  id: string;
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

export default function ProCreatePage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const name = file.name.toLowerCase();
        
        let type: 'logo' | 'headshot' | 'reference' = 'reference';
        if (name.includes('logo')) type = 'logo';
        else if (name.includes('headshot') || name.includes('photo') || name.includes('portrait')) type = 'headshot';
        
        const hasLogo = images.some(img => img.type === 'logo');
        const hasHeadshot = images.some(img => img.type === 'headshot');
        if (!hasLogo && images.length === 0) type = 'logo';
        else if (!hasHeadshot && images.length === 1) type = 'headshot';
        
        setImages(prev => [...prev, { id: crypto.randomUUID(), preview, name: file.name, type }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateImageType = (id: string, type: 'logo' | 'headshot' | 'reference') => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, type } : img));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Generate a detailed prompt template
  const generatePromptTemplate = async () => {
    const logo = images.find(img => img.type === 'logo');
    const headshot = images.find(img => img.type === 'headshot');
    
    if (!logo) {
      alert('Please upload a logo first so we can analyze your brand');
      return;
    }

    setLoading(true);
    setProgress('Analyzing your brand...');

    try {
      const response = await fetch('/api/studio/pro-create/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoImage: logo.preview,
          headshotImage: headshot?.preview,
          slideCount,
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedPrompt(data.prompt);
        setPrompt(data.prompt);
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

  const generateSlides = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const logo = images.find(img => img.type === 'logo');
    const headshot = images.find(img => img.type === 'headshot');

    setGenerating(true);
    setGeneratedSlides([]);

    // Initialize slides
    const initialSlides: GeneratedSlide[] = Array.from({ length: slideCount }, (_, i) => ({
      id: crypto.randomUUID(),
      slideNumber: i + 1,
      imageUrl: null,
      status: 'pending',
    }));
    setGeneratedSlides(initialSlides);

    // Generate each slide
    for (let i = 0; i < slideCount; i++) {
      setProgress(`Generating slide ${i + 1} of ${slideCount}...`);
      
      setGeneratedSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));

      try {
        // Build slide-specific prompt
        const slidePrompt = `${prompt}

---
NOW GENERATE SLIDE ${i + 1} OF ${slideCount}.
${i === 0 ? 'This is the HOOK slide - make it attention-grabbing with the headline prominent.' : ''}
${i === slideCount - 1 ? 'This is the FINAL CTA slide - include strong call to action.' : ''}
${i > 0 && i < slideCount - 1 ? `This is slide ${i + 1} - focus on building credibility and showcasing expertise.` : ''}

CRITICAL: Generate ONLY the background and design elements. 
- DO NOT generate any face or person
- DO NOT generate any logo
- Leave clear space where a headshot photo will be overlaid
- Leave space for a logo in the top left
- The real headshot and logo will be composited on top after generation
- Square format 1080x1080`;

        const response = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: slidePrompt, size: '1024x1024' })
        });

        const data = await response.json();

        if (data.success && data.imageUrl) {
          // Composite headshot and logo on top
          const compositeResponse = await fetch('/api/studio/pro-create/composite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              backgroundImage: data.imageUrl,
              logo: logo?.preview,
              headshot: headshot?.preview,
              slideNumber: i + 1,
              totalSlides: slideCount,
              isLastSlide: i === slideCount - 1,
            })
          });

          const compositeData = await compositeResponse.json();

          if (compositeData.success) {
            setGeneratedSlides(prev => prev.map((s, idx) => 
              idx === i ? { ...s, imageUrl: compositeData.imageUrl, status: 'complete' } : s
            ));
          } else {
            // Use original if composite fails
            setGeneratedSlides(prev => prev.map((s, idx) => 
              idx === i ? { ...s, imageUrl: data.imageUrl, status: 'complete' } : s
            ));
          }
        } else {
          throw new Error(data.error || 'Generation failed');
        }
      } catch (error: any) {
        console.error(`Slide ${i + 1} error:`, error);
        setGeneratedSlides(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error' } : s
        ));
      }
    }

    setGenerating(false);
    setProgress('');
  };

  const downloadAll = () => {
    generatedSlides.forEach((slide, i) => {
      if (slide.imageUrl) {
        const link = document.createElement('a');
        link.href = slide.imageUrl;
        link.download = `slide-${i + 1}.png`;
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
          const { url } = await uploadImageFromUrl(
            slide.imageUrl,
            'pro-create',
            `pro-create-${Date.now()}-slide-${slide.slideNumber}.png`
          );

          await supabase.from('generated_images').insert({
            title: `Pro Create - Slide ${slide.slideNumber}`,
            image_url: url,
            prompt_used: prompt.substring(0, 500),
            niche: 'General',
            style: 'pro-create',
            content_type: 'carousel',
          });
        }
      }
      alert('Saved to library!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
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
            <p className="text-white/50 text-sm">Write a detailed prompt or let AI help generate one</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            {/* Image Uploads */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">
                  Reference Images (logo, headshot, style references)
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
              
              {images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50"
                >
                  <Upload className="w-10 h-10 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Upload logo + headshot</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                        <Image src={img.preview} alt="" fill className="object-cover" />
                        <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={img.type}
                        onChange={(e) => updateImageType(img.id, e.target.value as any)}
                        className="mt-1 w-full bg-white/10 border-0 rounded text-xs text-white py-1"
                      >
                        <option value="logo" className="bg-gray-900">Logo</option>
                        <option value="headshot" className="bg-gray-900">Headshot</option>
                        <option value="reference" className="bg-gray-900">Reference</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Count */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-white/70">Slides:</label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                {[3, 5, 7, 10].map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
              </select>
              <button
                onClick={generatePromptTemplate}
                disabled={loading || images.length === 0}
                className="ml-auto bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Generate Prompt
              </button>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Detailed Prompt</label>
                {prompt && (
                  <button onClick={copyPrompt} className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write a detailed prompt describing the carousel you want to create. Include: brand colors, style direction, headlines for each slide, visual elements, etc.

Or click 'Generate Prompt' to have AI create a detailed prompt based on your uploaded logo."
                className="w-full h-80 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-mono"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateSlides}
              disabled={generating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progress}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {slideCount} Slides
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Slides</h2>
              {generatedSlides.some(s => s.imageUrl) && (
                <div className="flex gap-2">
                  <button onClick={downloadAll} className="text-sm text-white/60 hover:text-white flex items-center gap-1">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={saveToLibrary} disabled={loading} className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {generatedSlides.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Generated slides will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {generatedSlides.map(slide => (
                  <div key={slide.id} className="relative">
                    <div className={`aspect-square rounded-xl overflow-hidden border-2 ${
                      slide.status === 'complete' ? 'border-green-500' :
                      slide.status === 'generating' ? 'border-amber-500 animate-pulse' :
                      slide.status === 'error' ? 'border-red-500' : 'border-white/10'
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
                            <span className="text-white/30 text-xl font-bold">{slide.slideNumber}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
                      {slide.slideNumber}/{generatedSlides.length}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
