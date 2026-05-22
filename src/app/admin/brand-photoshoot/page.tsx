'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Trash2,
  RefreshCw,
  Camera,
  X
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

export default function BrandPhotoshootPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state - unified image list + prompt
  const [images, setImages] = useState<string[]>([]);
  const [scenePrompt, setScenePrompt] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [dragOver, setDragOver] = useState(false);
  
  // Optional brand details
  const [companyName, setCompanyName] = useState('');
  const [personName, setPersonName] = useState('');
  const [industry, setIndustry] = useState('');
  const [topic, setTopic] = useState('');

  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
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

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const submitToQueue = async () => {
    if (images.length === 0 && !scenePrompt) {
      alert('Add at least one image or a prompt');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/carousel/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          person_name: personName,
          industry,
          topic,
          scene_prompt: scenePrompt,
          slide_count: slideCount,
          // Pass all images - first one treated as primary by the processor
          headshot_url: images[0] || null,
          logo_url: images[1] || null,
          reference_images: images.length > 2 ? images.slice(2) : null,
          all_images: images,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Added to queue!');
        setShowForm(false);
        setImages([]);
        setScenePrompt('');
        setCompanyName('');
        setPersonName('');
        setIndustry('');
        setTopic('');
        fetchQueue();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this queue item?')) return;
    try {
      await fetch(`/api/carousel/queue?id=${id}`, { method: 'DELETE' });
      fetchQueue();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const downloadSlides = (item: QueueItem) => {
    (item.slides || []).filter(Boolean).forEach((slide, i) => {
      if (slide.imageUrl) {
        const link = document.createElement('a');
        link.href = slide.imageUrl;
        link.download = `${(item.company_name || 'photoshoot').replace(/\s+/g, '-')}-slide-${i + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
      case 'generating_slides':
        return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusText = (item: QueueItem) => {
    switch (item.status) {
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      case 'processing':
        return 'Starting...';
      case 'generating_slides':
        return `Slide ${item.current_slide}/${item.slide_count}`;
      default:
        return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
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
              <p className="text-white/50 text-sm">Upload images, tell AI what to do</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchQueue}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Photoshoot
            </button>
          </div>
        </div>

        {/* New Photoshoot Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onPaste={handlePaste}
            >
              <h2 className="text-xl font-bold mb-2">New Brand Photoshoot</h2>
              <p className="text-white/50 text-sm mb-6">
                Upload any images (headshots, logos, houses, locations) and tell the AI what to do with them.
              </p>

              {/* Image Upload - unified drag-and-drop */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mb-6 border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                  dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/30'
                }`}
              >
                {images.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative">
                          <Image
                            src={img}
                            alt=""
                            width={80}
                            height={80}
                            className="object-cover rounded-lg border border-white/10 w-20 h-20"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/30 text-center">
                      Drop more images here or paste from clipboard (Cmd+V)
                    </p>
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
                  placeholder="Tell the AI what to do with the images... e.g., 'Put this person in front of this house with this logo in the corner. Professional real estate photography style.'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-32 resize-none"
                />
                <p className="text-xs text-white/40 mt-1">
                  Describe each image and what role it plays. The AI will combine them based on your instructions.
                </p>
              </div>

              {/* Optional brand details */}
              <details className="mb-4">
                <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80 mb-3">+ Brand details (optional)</summary>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={personName}
                    onChange={e => setPersonName(e.target.value)}
                    placeholder="Person Name"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="Industry"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Topic/Focus"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </details>

              {/* Slide count */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm text-white/60">Slides:</label>
                <div className="flex gap-2">
                  {[1, 3, 5, 7, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => setSlideCount(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        slideCount === n 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={submitToQueue}
                  disabled={submitting || (images.length === 0 && !scenePrompt)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photoshoots yet</p>
            <p className="text-sm mt-2">Click "New Photoshoot" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                    {item.headshot_url ? (
                      <Image src={item.headshot_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-2xl">🎨</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(item.status)}
                      <span className="font-semibold">{item.company_name || 'Photoshoot'}</span>
                      {item.person_name && <span className="text-white/50">- {item.person_name}</span>}
                    </div>
                    <div className="text-sm text-white/50">
                      {item.industry && <span>{item.industry} • </span>}
                      {item.slide_count} slides
                      {item.topic && <span className="block mt-1 text-white/40 truncate">{item.topic}</span>}
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {getStatusText(item)}
                      {item.completed_at && ` • Completed ${new Date(item.completed_at).toLocaleString()}`}
                    </div>
                  </div>

                  {item.slides && item.slides.length > 0 && (
                    <div className="flex gap-1">
                      {item.slides.slice(0, 5).filter(Boolean).map((slide, i) => (
                        <div key={i} className="w-12 h-12 rounded overflow-hidden bg-white/5">
                          {slide.imageUrl ? (
                            <Image src={slide.imageUrl} alt="" width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white/20">{i + 1}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {item.status === 'complete' && (
                      <button
                        onClick={() => downloadSlides(item)}
                        className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg"
                        title="Download all slides"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
