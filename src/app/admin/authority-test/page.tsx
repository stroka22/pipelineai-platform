'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Sparkles, Loader2, X, Download } from 'lucide-react';

interface GeneratedScene {
  scene: string;
  headline: string;
  subtext: string;
  description: string;
  imageUrl: string | null;
  success: boolean;
  error?: string;
}

export default function AuthorityTestPage() {
  const [headshotPreview, setHeadshotPreview] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<GeneratedScene[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setHeadshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runTest = async () => {
    if (!headshotPreview) {
      alert('Please upload a headshot first');
      return;
    }

    setLoading(true);
    setProgress('AI is analyzing and creating scene concepts...');
    setResults([]);

    try {
      const response = await fetch('/api/carousel/authority-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headshotBase64: headshotPreview,
          name,
          company,
          industry,
          phone,
          goal: goal || 'Make this person look like the trusted authority and go-to expert in their industry',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
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

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Authority Scene Test
            </h1>
            <p className="text-white/50 text-sm">
              Test: Can AI generate scenes with your client IN them (like ChatGPT)?
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-4">1. Upload Headshot</h2>
              
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              
              {headshotPreview ? (
                <div className="relative w-48 h-48 mx-auto">
                  <Image 
                    src={headshotPreview} 
                    alt="Headshot" 
                    fill 
                    className="object-cover rounded-xl" 
                  />
                  <button
                    onClick={() => setHeadshotPreview('')}
                    className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-amber-500/50"
                >
                  <Upload className="w-10 h-10 text-white/30 mb-2" />
                  <span className="text-white/50">Upload headshot photo</span>
                </button>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-4">2. Basic Info (Optional)</h2>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name (e.g., Craig Pitts)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company (e.g., Small Business Assets & Capital)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="Industry (e.g., Business Funding / SBA Loans)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone (e.g., (513) 264-3318)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-4">3. Goal (Optional)</h2>
              
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="Describe what you want to achieve... (e.g., 'Make a convincing carousel that positions my client as the trusted authority in business funding')"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none"
              />
              
              <p className="text-xs text-white/40 mt-2">
                Leave blank for default: "Make this person look like the trusted authority and go-to expert"
              </p>
            </div>

            <button
              onClick={runTest}
              disabled={loading || !headshotPreview}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progress}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Authority Scenes
                </>
              )}
            </button>
            
            <p className="text-xs text-white/40 text-center">
              This will generate 4 different scenes with the person IN them (not just overlaid).
              <br />
              Takes ~60-90 seconds. Compare to see if likeness is preserved.
            </p>
          </div>

          {/* Results */}
          <div>
            <h2 className="font-semibold mb-4">Generated Scenes</h2>
            
            {results.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Results will appear here</p>
                <p className="text-white/30 text-sm mt-2">
                  AI will create scene concepts and generate images with the person in them
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="aspect-square relative">
                      {result.imageUrl ? (
                        <>
                          <Image 
                            src={result.imageUrl} 
                            alt={result.scene} 
                            fill 
                            className="object-cover" 
                          />
                          <button
                            onClick={() => downloadImage(result.imageUrl!, `scene-${i + 1}.png`)}
                            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-lg"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full bg-red-900/20 flex items-center justify-center">
                          <p className="text-red-400 text-sm px-4 text-center">
                            {result.error || 'Failed to generate'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-amber-400 mb-1">{result.scene}</div>
                      <div className="font-bold text-lg">{result.headline}</div>
                      <div className="text-sm text-white/60 mt-1">{result.subtext}</div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-amber-400 mb-2">Evaluate Results</h3>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Does the face match the uploaded headshot?</li>
                    <li>• Are the scenes professional and compelling?</li>
                    <li>• Would you use these for a real client?</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
