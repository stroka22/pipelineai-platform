'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Upload, Globe, Phone, Palette, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

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

    setLoading(true);

    try {
      // Convert files to base64
      const carouselBase64 = await fileToBase64(carouselFile);
      const logoBase64 = logoFile ? await fileToBase64(logoFile) : null;

      // Create checkout session
      const response = await fetch('/api/checkout/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          carouselImage: carouselBase64,
          logoImage: logoBase64,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Store form data in sessionStorage for after payment
        sessionStorage.setItem('brandingData', JSON.stringify({
          ...formData,
          carouselImage: carouselBase64,
          logoImage: logoBase64,
        }));
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
              $10 per branded image
            </div>
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
                <div className="relative">
                  <Image
                    src={carouselPreview}
                    alt="Carousel preview"
                    width={400}
                    height={400}
                    className="rounded-xl mx-auto max-h-[300px] object-contain"
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
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Brand My Image - $10
                </>
              )}
            </button>

            <p className="text-white/40 text-xs text-center">
              Secure payment powered by Stripe. Your branded image will be ready in about 30 seconds.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
