'use client';

import { useState, useEffect, useRef } from 'react';
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
  Upload,
  Camera,
  Play
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

export default function CarouselQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [personName, setPersonName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [topic, setTopic] = useState('');
  const [scenePrompt, setScenePrompt] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [headshotPreview, setHeadshotPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  
  const headshotInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

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
    const interval = setInterval(fetchQueue, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'headshot' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'headshot') {
        setHeadshotPreview(e.target?.result as string);
      } else {
        setLogoPreview(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input so same file can be selected again
    if (referenceInputRef.current) {
      referenceInputRef.current.value = '';
    }
  };

  const removeReference = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const submitToQueue = async () => {
    if (!scenePrompt) {
      alert('Scene/prompt instructions are required');
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
          title,
          phone,
          email,
          website,
          industry,
          topic,
          scene_prompt: scenePrompt,
          slide_count: slideCount,
          headshot_url: headshotPreview || null,
          logo_url: logoPreview || null,
          reference_images: referenceImages.length > 0 ? referenceImages : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Added to queue!');
        setShowForm(false);
        // Reset form
        setCompanyName('');
        setPersonName('');
        setTitle('');
        setPhone('');
        setEmail('');
        setWebsite('');
        setIndustry('');
        setTopic('');
        setScenePrompt('');
        setHeadshotPreview('');
        setLogoPreview('');
        setReferenceImages([]);
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
    item.slides.forEach((slide, i) => {
      if (slide.imageUrl) {
        const link = document.createElement('a');
        link.href = slide.imageUrl;
        link.download = `${item.company_name.replace(/\s+/g, '-')}-slide-${i + 1}.png`;
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
              <p className="text-white/50 text-sm">Put clients in professional scenes with AI</p>
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

        {/* Add Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold mb-2">New Brand Photoshoot</h2>
              <p className="text-white/50 text-sm mb-6">Upload a headshot to place the person in scenes, or leave empty for prompt-based graphics.</p>
              
              {/* Mode indicator */}
              <div className={`mb-6 p-3 rounded-lg border ${headshotPreview ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <p className="text-sm">
                  {headshotPreview ? (
                    <span className="text-purple-300">📸 <strong>Person Mode:</strong> AI will place this person in professional scenes</span>
                  ) : (
                    <span className="text-blue-300">🎨 <strong>Graphics Mode:</strong> AI will generate images from your prompt</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Headshot */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Headshot (optional)</label>
                  <input ref={headshotInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'headshot')} className="hidden" />
                  {headshotPreview ? (
                    <div className="relative w-32 h-32">
                      <Image src={headshotPreview} alt="" fill className="object-cover rounded-lg" />
                      <button onClick={() => setHeadshotPreview('')} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => headshotInputRef.current?.click()} className="w-32 h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-purple-500/50 gap-1">
                      <Upload className="w-6 h-6 text-white/30" />
                      <span className="text-xs text-white/30">Optional</span>
                    </button>
                  )}
                </div>
                
                {/* Logo */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Logo (optional)</label>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="hidden" />
                  {logoPreview ? (
                    <div className="relative w-32 h-32">
                      <Image src={logoPreview} alt="" fill className="object-contain rounded-lg bg-white/5 p-2" />
                      <button onClick={() => setLogoPreview('')} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} className="w-32 h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-purple-500/50 gap-1">
                      <Upload className="w-6 h-6 text-white/30" />
                      <span className="text-xs text-white/30">Optional</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reference Images */}
              <div className="mb-4">
                <label className="text-sm text-white/60 mb-2 block">Reference Images (optional)</label>
                <p className="text-xs text-white/40 mb-2">Upload houses, locations, style examples - AI will analyze and incorporate them</p>
                <input 
                  ref={referenceInputRef} 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleReferenceUpload} 
                  className="hidden" 
                />
                <div className="flex flex-wrap gap-2">
                  {referenceImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <Image src={img} alt="" fill className="object-cover rounded-lg" />
                      <button 
                        onClick={() => removeReference(i)} 
                        className="absolute -top-1 -right-1 bg-red-500 p-0.5 rounded-full text-xs w-5 h-5 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => referenceInputRef.current?.click()} 
                    className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center hover:border-purple-500/50 gap-1"
                  >
                    <Plus className="w-5 h-5 text-white/30" />
                    <span className="text-[10px] text-white/30">Add</span>
                  </button>
                </div>
              </div>

              {/* Prompt/Scene Instructions */}
              <div className="mb-4">
                <label className="text-sm text-white/60 mb-2 block">
                  {headshotPreview ? 'Scene Instructions *' : 'Image Prompt *'}
                </label>
                <textarea
                  value={scenePrompt}
                  onChange={e => setScenePrompt(e.target.value)}
                  placeholder={headshotPreview 
                    ? "Describe the scenes (e.g., 'Standing in front of the house in reference image, walking through property with clients')"
                    : "Describe the images to generate (e.g., 'Professional real estate infographics about home buying tips, modern design, blue color scheme')"
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-28 resize-none"
                />
                <p className="text-xs text-white/40 mt-1">
                  {headshotPreview 
                    ? "AI will place this person in each scene while preserving their exact likeness"
                    : "AI will generate unique images for each slide based on this prompt"
                  }
                  {referenceImages.length > 0 && " • Reference images will be analyzed and incorporated"}
                </p>
              </div>

              {/* Optional brand info - collapsible */}
              <details className="mb-4">
                <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80 mb-3">+ Add brand details (optional)</summary>
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={submitToQueue}
                  disabled={submitting || !scenePrompt}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  {headshotPreview ? 'Start Photoshoot' : 'Generate Images'}
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
                  {/* Headshot thumbnail or mode indicator */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                    {item.headshot_url ? (
                      <Image src={item.headshot_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-2xl">🎨</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(item.status)}
                      <span className="font-semibold">{item.company_name}</span>
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

                  {/* Preview slides */}
                  {item.slides && item.slides.length > 0 && (
                    <div className="flex gap-1">
                      {item.slides.slice(0, 5).map((slide, i) => (
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

                  {/* Actions */}
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
