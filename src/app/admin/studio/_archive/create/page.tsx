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
  Plus,
  Trash2,
  Save,
  ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUrl } from '@/lib/storage';

interface AttachedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export default function AICreatePage() {
  const [prompt, setPrompt] = useState('');
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [slideCount, setSlideCount] = useState(5);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 50 - attachedImages.length;
    const toAdd = files.slice(0, remaining);

    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setAttachedImages(prev => [...prev, {
          id: crypto.randomUUID(),
          file,
          preview,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setAttachedImages(prev => prev.filter(img => img.id !== id));
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    setProgress('Analyzing your request...');
    setGeneratedImages([]);

    try {
      // Convert attached images to base64
      const imageData = attachedImages.map(img => ({
        name: img.name,
        data: img.preview
      }));

      const response = await fetch('/api/studio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: imageData,
          slideCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Generate each slide
      const slides: GeneratedImage[] = [];
      for (let i = 0; i < data.slidePrompts.length; i++) {
        setProgress(`Generating slide ${i + 1} of ${data.slidePrompts.length}...`);
        
        const slideResponse = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: data.slidePrompts[i],
            size: '1024x1024'
          })
        });

        const slideData = await slideResponse.json();
        
        if (slideData.success && slideData.imageUrl) {
          slides.push({
            id: crypto.randomUUID(),
            url: slideData.imageUrl,
            prompt: data.slidePrompts[i]
          });
          setGeneratedImages([...slides]);
        }
      }

      setProgress('');
    } catch (error: any) {
      console.error('Generation error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const saveToLibrary = async () => {
    if (generatedImages.length === 0) return;
    
    setSaving(true);
    try {
      for (const image of generatedImages) {
        // Upload to storage
        const { url: storageUrl } = await uploadImageFromUrl(
          image.url,
          'generated',
          `ai-create-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`
        );

        // Save to database
        await supabase.from('generated_images').insert({
          title: `AI Created - ${new Date().toLocaleDateString()}`,
          image_url: storageUrl,
          prompt_used: image.prompt,
          niche: 'General',
          style: 'custom',
          content_type: 'carousel'
        });
      }

      alert(`Saved ${generatedImages.length} images to library!`);
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addToQueue = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setAddingToQueue(true);
    setProgress('Analyzing your request...');

    try {
      // First, get GPT-4o to analyze and create the slide prompts
      const imageData = attachedImages.map(img => ({
        name: img.name,
        data: img.preview
      }));

      const response = await fetch('/api/studio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: imageData,
          slideCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze request');
      }

      setProgress('Adding to queue...');

      // Add to carousel queue with the open_prompt containing all slide prompts
      const queueResponse = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `AI Create - ${new Date().toLocaleDateString()}`,
          niche: 'General',
          category: 'custom',
          style: 'custom',
          slideCount: data.slidePrompts.length,
          openPrompt: prompt,
          slidePrompts: data.slidePrompts, // Pass the individual prompts
          priority: 5,
        })
      });

      const queueData = await queueResponse.json();

      if (queueData.success) {
        alert('Added to queue! Your content will be generated in the background. Check the Queue page for status.');
        setPrompt('');
        setTitle('');
        setAttachedImages([]);
      } else {
        throw new Error(queueData.error);
      }
    } catch (error: any) {
      console.error('Queue error:', error);
      alert('Error: ' + error.message);
    } finally {
      setAddingToQueue(false);
      setProgress('');
    }
  };

  const downloadAll = () => {
    generatedImages.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `slide-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/studio" 
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Create
              </h1>
              <p className="text-white/50 text-sm">Describe what you want + attach reference images</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            {/* Title (optional) */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Project Title <span className="text-white/40">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Craig Pitts Business Funding Carousel"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Describe what you want to create
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Craig Pitts (513) 264-3318 - 15 years helping businesses get funds. Create a convincing 5-slide carousel to help Craig grow his Business Funding clientele. Logo and professional picture attached."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>

            {/* Slide Count */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Number of slides to generate
              </label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {[1, 3, 5, 7, 10].map(n => (
                  <option key={n} value={n} className="bg-gray-900">{n} {n === 1 ? 'slide' : 'slides'}</option>
                ))}
              </select>
            </div>

            {/* Attached Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/70">
                  Reference Images ({attachedImages.length}/50)
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachedImages.length >= 50}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50"
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

              {attachedImages.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                >
                  <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">
                    Click to upload logos, headshots, or reference images
                  </p>
                  <p className="text-white/30 text-xs mt-1">PNG, JPG up to 50 images</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {attachedImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square">
                      <Image
                        src={img.preview}
                        alt={img.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {attachedImages.length < 50 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-white/30" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateContent}
                disabled={loading || addingToQueue || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Now
                  </>
                )}
              </button>
              <button
                onClick={addToQueue}
                disabled={loading || addingToQueue || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {addingToQueue ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progress || 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add to Queue
                  </>
                )}
              </button>
            </div>
            <p className="text-white/40 text-xs text-center">
              "Generate Now" creates immediately. "Add to Queue" processes in the background.
            </p>
          </div>

          {/* Right: Output */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Content</h2>
              {generatedImages.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={downloadAll}
                    className="text-sm text-white/60 hover:text-white flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                  <button
                    onClick={saveToLibrary}
                    disabled={saving}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Library
                  </button>
                </div>
              )}
            </div>

            {generatedImages.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Generated images will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square relative rounded-xl overflow-hidden border border-white/10">
                      <Image
                        src={image.url}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {index + 1}/{generatedImages.length}
                      </div>
                    </div>
                    <a
                      href={image.url}
                      download={`slide-${index + 1}.png`}
                      className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </a>
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
