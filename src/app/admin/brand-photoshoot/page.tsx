'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Download,
  Trash2,
  Camera,
  X,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus
} from 'lucide-react';

interface QueueItem {
  id: string;
  company_name: string;
  person_name: string;
  industry: string;
  topic: string;
  slide_count: number;
  status: string;
  current_slide: number;
  slides: any[];
  created_at: string;
  completed_at: string;
  headshot_url: string;
  logo_url: string;
}

interface GeneratedSlide {
  imageUrl: string;
  storageUrl: string | null;
}

export default function BrandPhotoshootPage() {
  const [images, setImages] = useState<string[]>([]);
  const [scenePrompt, setScenePrompt] = useState('');
  const [slideCount, setSlideCount] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  
  // Brand details
  const [companyName, setCompanyName] = useState('');
  const [personName, setPersonName] = useState('');
  const [industry, setIndustry] = useState('');
  const [topic, setTopic] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [currentGenSlide, setCurrentGenSlide] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);

  // Queue history
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(dataUrl); return; }
          const maxW = 512;
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    for (const file of files) {
      const dataUrl = await processFile(file);
      setImages(prev => [...prev, dataUrl]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const dataUrl = await processFile(file);
          setImages(prev => [...prev, dataUrl]);
        }
      }
    }
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carousel/queue');
      const data = await response.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate Now - calls API directly like the test page
  const generateNow = async () => {
    if (images.length === 0 && !scenePrompt) {
      setGenError('Add at least one image or a prompt');
      return;
    }

    setGenerating(true);
    setGenError(null);
    setGeneratedSlides([]);
    setCurrentGenSlide(0);

    const newSlides: GeneratedSlide[] = [];

    for (let i = 0; i < slideCount; i++) {
      setCurrentGenSlide(i + 1);
      try {
        const variations = [
          'confident professional pose, looking at camera',
          'reviewing documents at desk',
          'in a meeting with a client',
          'presenting to a small group',
          'standing confidently in professional setting',
          'warm, approachable expression',
          'thoughtful expression, hand on chin',
          'gesturing while explaining something',
          'casual but professional stance',
          'pointing at something off-camera',
        ];
        const variation = variations[i % variations.length];
        const fullPrompt = `${scenePrompt}\n\nVariation: ${variation}\n\nIndustry: ${industry || 'Business Professional'}`;

        const res = await fetch('/api/carousel/generate-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images,
            prompt: fullPrompt,
            slide_number: i + 1,
            total_slides: slideCount,
            company_name: companyName,
            industry,
            topic,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Generation failed');
        }

        if (data.imageUrl) {
          newSlides.push({ imageUrl: data.imageUrl, storageUrl: data.storageUrl || null });
          setGeneratedSlides([...newSlides]);
        } else {
          throw new Error('No image returned from API');
        }
      } catch (err: any) {
        setGenError(`Slide ${i + 1} failed: ${err.message}`);
        break;
      }
    }

    setGenerating(false);

    // Also save to library via the API
    if (newSlides.length > 0) {
      try {
        await fetch('/api/carousel/save-to-library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: newSlides.map((s, i) => ({
              imageUrl: s.storageUrl || s.imageUrl,
              prompt: scenePrompt,
              niche: industry || 'General',
              category: 'tips',
              slide_number: i + 1,
              source: 'brand_photoshoot',
            })),
          }),
        });
      } catch (err) {
        console.error('Failed to save to library:', err);
      }
    }
  };

  const downloadSlide = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(companyName || 'photoshoot').replace(/\s+/g, '-')}-slide-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    generatedSlides.forEach((slide, i) => {
      setTimeout(() => downloadSlide(slide.imageUrl, i), i * 500);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
      case 'generating_slides': return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusText = (item: QueueItem) => {
    switch (item.status) {
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      case 'processing': return 'Starting...';
      case 'generating_slides': return `Slide ${item.current_slide}/${item.slide_count}`;
      default: return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white" onPaste={handlePaste}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/studio" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6 text-purple-400" />
                Brand Photoshoot
              </h1>
              <p className="text-white/50 text-sm">Upload images, tell AI what to do, get results instantly</p>
            </div>
          </div>

          <button
            onClick={() => { fetchQueue(); setShowHistory(!showHistory); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showHistory ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Clock className="w-5 h-5" />
            History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div>
            {/* Image Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`mb-6 border-2 border-dashed rounded-xl p-6 transition-colors ${
                dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/30'
              }`}
            >
              {images.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/60">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                    <button type="button" onClick={() => setImages([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="object-cover rounded-lg border border-white/10 w-20 h-20" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/30 text-center">Drop more or paste from clipboard (Cmd+V)</p>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center gap-2">
                  <Camera className="w-10 h-10 text-white/20" />
                  <p className="text-white/40">Drag images here or paste from clipboard (Cmd+V)</p>
                  <p className="text-xs text-white/25">Headshots, logos, houses, locations, style examples</p>
                </div>
              )}
            </div>

            {/* Prompt */}
            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">What do you want? *</label>
              <textarea
                value={scenePrompt}
                onChange={e => setScenePrompt(e.target.value)}
                placeholder="Tell the AI what to do... e.g., 'Put this person in front of this house with this logo in the corner. Professional real estate photography style.'"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Brand details */}
            <details className="mb-4">
              <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80">+ Brand details (optional)</summary>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Person Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic/Focus" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
              </div>
            </details>

            {/* Slide count */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm text-white/60">Images to generate:</label>
              <div className="flex gap-2">
                {[1, 3, 5, 7, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      slideCount === n ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generateNow}
              disabled={generating || (images.length === 0 && !scenePrompt)}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating slide {currentGenSlide}/{slideCount}...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate {slideCount} Image{slideCount > 1 ? 's' : ''}
                </>
              )}
            </button>

            {genError && (
              <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {genError}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {generatedSlides.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Results ({generatedSlides.length} image{generatedSlides.length > 1 ? 's' : ''})
                  </h2>
                  <button
                    onClick={downloadAll}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {generatedSlides.map((slide, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.imageUrl} alt={`Slide ${i + 1}`} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => downloadSlide(slide.imageUrl, i)}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs">
                        {i + 1}/{generatedSlides.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                <p className="text-white/60">Generating slide {currentGenSlide} of {slideCount}...</p>
                <p className="text-xs text-white/30">This may take 30-60 seconds per image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                <p>Generated images will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Queue History</h2>
              <button onClick={fetchQueue} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-white/30 text-center py-8">No previous photoshoots</p>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                        {item.headshot_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.headshot_url} alt="" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xl">🎨</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(item.status)}
                          <span className="font-semibold">{item.company_name || 'Photoshoot'}</span>
                        </div>
                        <div className="text-sm text-white/50">
                          {item.industry && <span>{item.industry} • </span>}
                          {item.slide_count} slides • {getStatusText(item)}
                        </div>
                        {item.slides && item.slides.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.slides.slice(0, 5).filter(Boolean).map((slide: any, i: number) => (
                              <div key={i} className="w-10 h-10 rounded overflow-hidden bg-white/5">
                                {slide.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={slide.imageUrl} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-white/20">{i + 1}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => { if (confirm('Delete?')) fetch(`/api/carousel/queue?id=${item.id}`, { method: 'DELETE' }).then(fetchQueue); }} className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
