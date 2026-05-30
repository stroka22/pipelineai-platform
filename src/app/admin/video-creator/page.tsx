'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Video, Image as ImageIcon, Upload, X, Save, Download, Play, Sparkles, Clock, Camera
} from 'lucide-react';

type VideoMode = 'text' | 'image' | 'frames';

export default function VideoCreatorPage() {
  const [mode, setMode] = useState<VideoMode>('text');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [quality, setQuality] = useState<'lite' | 'fast' | 'quality'>('fast');
  const [images, setImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  
  // Generation state
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [result, setResult] = useState<{ videoUrl: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Save state
  const [saving, setSaving] = useState(false);

  const processFile = async (file: File): Promise<string> => {
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

  const generateVideo = async () => {
    if (!prompt && images.length === 0) {
      setError('Provide a prompt or images');
      return;
    }

    if (mode === 'frames' && images.length < 2) {
      setError('Frame mode requires at least 2 images (first and last frame)');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);
    setGenStatus('Starting video generation...');

    try {
      const body: any = {
        prompt,
        mode: quality,
        aspectRatio,
        enhancePrompt: true,
      };

      if (mode === 'image' && images.length > 0) {
        body.images = [images[0]]; // First image as starting frame
      } else if (mode === 'frames' && images.length >= 2) {
        body.images = images.slice(0, 2); // First and last frame
      }

      setGenStatus('Sending to Veo API...');

      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video generation failed');
      }

      setResult({ videoUrl: data.videoUrl, filename: data.filename });
      setGenStatus('Video generated successfully!');
    } catch (err: any) {
      setError(err.message);
      setGenStatus('');
    } finally {
      setGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!result?.videoUrl) return;
    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = result.filename || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToGallery = async () => {
    if (!result?.videoUrl) return;
    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('gallery_items').insert({
        niche: 'real-estate',
        type: 'video',
        title: prompt.substring(0, 100) || 'Generated video',
        images: [result.videoUrl],
        caption: prompt,
        is_active: true,
      });
      if (error) throw error;
      alert('Saved to gallery!');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    }
    setSaving(false);
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
                <Video className="w-6 h-6 text-purple-400" />
                Video Creator
              </h1>
              <p className="text-white/50 text-sm">Generate branded videos with AI (Veo 3.1)</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setMode('text')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  mode === 'text' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Text to Video
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  mode === 'image' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                Image to Video
              </button>
              <button
                onClick={() => setMode('frames')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  mode === 'frames' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                First/Last Frame
              </button>
            </div>

            {/* Image Upload (for image/frames modes) */}
            {mode !== 'text' && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                  dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/30'
                }`}
              >
                {images.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                      <button onClick={() => setImages([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                          <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400">
                            <X className="w-3 h-3" />
                          </button>
                          <div className="text-xs text-white/30 mt-1 text-center">
                            {mode === 'frames' ? (i === 0 ? 'First' : i === 1 ? 'Last' : `Ref ${i - 1}`) : `Image ${i + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                    {mode === 'frames' && images.length < 2 && (
                      <p className="text-xs text-amber-400 mb-2">Add at least 2 images for first/last frame mode</p>
                    )}
                    <label className="flex items-center justify-center gap-2 py-2 text-sm text-white/40 hover:text-white/60 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Add more (or paste from clipboard)
                      <input type="file" accept="image/*" multiple onChange={e => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(async f => {
                          const url = await processFile(f);
                          setImages(prev => [...prev, url]);
                        });
                      }} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                    <Camera className="w-10 h-10 text-white/20 mb-2" />
                    <p className="text-white/40 text-sm">
                      {mode === 'frames' ? 'Drop first & last frame images' : 'Drop image to animate'}
                    </p>
                    <p className="text-xs text-white/25 mt-1">Or paste from clipboard (Cmd+V)</p>
                    <input type="file" accept="image/*" multiple onChange={e => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(async f => {
                        const url = await processFile(f);
                        setImages(prev => [...prev, url]);
                      });
                    }} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* Prompt */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                Video Description {mode === 'text' ? '*' : '(optional with image)'}
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={
                  mode === 'text' 
                    ? "Describe the video... e.g., 'A drone shot flying over a luxury waterfront property at golden hour, smooth cinematic motion, warm lighting'"
                    : mode === 'image' 
                    ? "Describe how to animate the image... e.g., 'Slow zoom into the property, gentle camera pan, warm sunset lighting'"
                    : "Describe the transition between frames... e.g., 'Smooth camera pan from the exterior to the living room, cinematic real estate tour'"
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Aspect Ratio</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      aspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    📱 9:16
                    <span className="text-xs text-white/40">Reels</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                      aspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    🖥️ 16:9
                    <span className="text-xs text-white/40">Wide</span>
                  </button>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Quality</label>
                <div className="flex gap-2">
                  {[
                    { id: 'lite', label: 'Lite', desc: '$', color: 'text-green-400' },
                    { id: 'fast', label: 'Fast', desc: '$$', color: 'text-amber-400' },
                    { id: 'quality', label: 'Best', desc: '$$$', color: 'text-purple-400' },
                  ].map(q => (
                    <button
                      key={q.id}
                      onClick={() => setQuality(q.id as any)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                        quality === q.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {q.label}
                      <div className={`text-xs ${quality === q.id ? 'text-white/60' : q.color}`}>{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVideo}
              disabled={generating || (!prompt && images.length === 0) || (mode === 'frames' && images.length < 2)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating video...
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  Generate Video
                </>
              )}
            </button>

            {generating && (
              <div className="text-center">
                <p className="text-white/40 text-sm">{genStatus}</p>
                <p className="text-white/25 text-xs mt-1">Video generation takes 1-3 minutes</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                  <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm break-words">
                {error}
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            {result ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <video
                    src={result.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full"
                    style={{ aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9', maxHeight: '500px' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadVideo}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={saveToGallery}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save to Gallery
                  </button>
                </div>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <Video className="w-16 h-16 text-purple-400" />
                  <Loader2 className="w-8 h-8 text-purple-300 absolute -bottom-1 -right-1 animate-spin" />
                </div>
                <p className="text-white/60">{genStatus || 'Generating video...'}</p>
                <p className="text-xs text-white/30">This takes 1-3 minutes depending on quality setting</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Generated video will appear here</p>
                <p className="text-xs text-white/25 mt-2">Choose a mode, add a prompt, and click Generate</p>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Tips */}
        <div className="mt-8 bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-purple-400 font-semibold mb-3">Veo Prompt Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-white/50">
            <div>
              <p className="text-white/70 font-medium mb-1">For Real Estate:</p>
              <ul className="space-y-1 text-xs">
                <li>• "Cinematic drone shot flying over luxury waterfront property at golden hour"</li>
                <li>• "Interior walkthrough of modern kitchen, smooth tracking shot, natural lighting"</li>
                <li>• "Aerial view of suburban neighborhood, slow zoom into listed property"</li>
              </ul>
            </div>
            <div>
              <p className="text-white/70 font-medium mb-1">For Portraits (Reels):</p>
              <ul className="space-y-1 text-xs">
                <li>• "Professional woman walking into modern office building, confident, 9:16 vertical"</li>
                <li>• "Close-up of agent handing keys to happy couple, celebration moment"</li>
                <li>• "Agent standing in front of sold sign, warm smile, successful sale moment"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
