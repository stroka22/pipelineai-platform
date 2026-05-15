'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Upload, Globe, Phone, Palette, Loader2, Sparkles, Image as ImageIcon, X, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandingPage() {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    businessName: '',
    phoneNumber: '',
    brandColors: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [carouselFile, setCarouselFile] = useState<File | null>(null);
  const [carouselPreview, setCarouselPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [progress, setProgress] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCarouselUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarouselFile(file);
      setCarouselPreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!carouselFile) {
      setError('Please upload a carousel image to brand');
      return;
    }

    if (!formData.businessName) {
      setError('Please enter your business name');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress('Creating your branded image...');

    try {
      const carouselBase64 = await fileToBase64(carouselFile);
      const logoBase64 = logoFile ? await fileToBase64(logoFile) : null;

      const response = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carouselImage: carouselBase64,
          logoImage: logoBase64,
          businessName: formData.businessName,
          websiteUrl: formData.websiteUrl,
          phoneNumber: formData.phoneNumber,
          brandColors: formData.brandColors,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImages([data.imageUrl]);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      if (imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `branded-image-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `branded-image-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleStartOver = () => {
    setGeneratedImages([]);
    setIsGenerating(false);
    setCarouselFile(null);
    setCarouselPreview(null);
    setProgress('');
  };

  // Show results if we have generated image
  if (generatedImages.length > 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-lg mx-auto px-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Branded Image is Ready!
              </h1>
              <p className="text-white/60">Download your AI-branded carousel image below</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                <Image
                  src={generatedImages[0]}
                  alt="Branded image"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <button
                onClick={() => handleDownload(generatedImages[0], 0)}
                className="w-full bg-[#C96A2B] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B55D24] transition-all"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="inline-flex items-center gap-2 text-[#C96A2B] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Brand Another Image
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show generating state
  if (isGenerating) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md px-6">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-[#C96A2B]/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-[#C96A2B] animate-pulse" />
              </div>
              <Loader2 className="w-32 h-32 text-[#C96A2B] animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Creating Your Branded Image</h2>
            <p className="text-white/60 mb-4">{progress}</p>
            <p className="text-white/40 text-sm">This usually takes 20-40 seconds...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#C96A2B]/10 border border-[#C96A2B]/30 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Branding
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Brand Your Content
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Upload a carousel image and we'll add your business name, phone number, and branding using AI.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
              FREE - Limited Time
            </div>
            <p className="mt-4 text-white/40 text-sm max-w-lg mx-auto">
              Note: AI image generation may produce inconsistent results including text errors or visual glitches. 
              We're offering this tool free while the technology improves.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Carousel Image Upload */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C96A2B]" />
                Carousel Image to Brand *
              </h2>
              
              {carouselPreview ? (
                <div className="relative max-w-md mx-auto">
                  <Image
                    src={carouselPreview}
                    alt="Carousel preview"
                    width={400}
                    height={400}
                    className="rounded-xl w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => { setCarouselFile(null); setCarouselPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#C96A2B]/50 transition-colors">
                  <Upload className="w-10 h-10 text-white/40 mb-2" />
                  <span className="text-white/60 text-sm">Click to upload carousel image</span>
                  <span className="text-white/40 text-xs mt-1">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCarouselUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Business Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Business Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., Alpha Roofing"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Brand Colors (optional)
                </label>
                <input
                  type="text"
                  value={formData.brandColors}
                  onChange={(e) => setFormData({ ...formData, brandColors: e.target.value })}
                  placeholder="e.g., Navy blue, orange, white"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                />
              </div>
            </div>

            {/* Logo Upload (Optional) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Logo (Optional)</h2>
              <p className="text-white/50 text-sm mb-4">Upload your logo to help AI match your brand style</p>
              
              {logoPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={150}
                    height={150}
                    className="rounded-xl object-contain bg-white/10 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#C96A2B]/50 transition-colors">
                  <Upload className="w-8 h-8 text-white/40 mb-2" />
                  <span className="text-white/60 text-xs">Upload logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !carouselFile}
              className="w-full bg-[#C96A2B] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Brand Image - FREE
            </button>

            <p className="text-white/40 text-xs text-center">
              Your branded images will be ready in about 30 seconds each.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
