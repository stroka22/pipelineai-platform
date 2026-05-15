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
  const [carouselFiles, setCarouselFiles] = useState<File[]>([]);
  const [carouselPreviews, setCarouselPreviews] = useState<string[]>([]);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setCarouselFiles(prev => [...prev, ...newFiles]);
      setCarouselPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeCarousel = (index: number) => {
    setCarouselFiles(prev => prev.filter((_, i) => i !== index));
    setCarouselPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (carouselFiles.length === 0) {
      setError('Please upload at least one carousel image to brand');
      return;
    }

    if (!formData.businessName) {
      setError('Please enter your business name');
      return;
    }

    setLoading(true);

    try {
      // Convert files to base64
      console.log('Converting files to base64...');
      const carouselImages = await Promise.all(carouselFiles.map(f => fileToBase64(f)));
      const logoBase64 = logoFile ? await fileToBase64(logoFile) : null;
      
      console.log('carouselImages count:', carouselImages.length);
      console.log('First image length:', carouselImages[0]?.length);

      // Store form data in sessionStorage and go directly to generate (free)
      const dataToStore = {
        ...formData,
        carouselImages,
        logoImage: logoBase64,
      };
      
      console.log('Storing data with keys:', Object.keys(dataToStore));
      sessionStorage.setItem('brandingData', JSON.stringify(dataToStore));
      
      // Verify it was stored
      const verify = sessionStorage.getItem('brandingData');
      console.log('Data stored successfully:', !!verify);
      
      window.location.href = '/brand/generate';
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again. ' + (err.message || ''));
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
              Upload carousel images and we'll add your business name, phone number, and branding using AI.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
              FREE - Limited Time
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Carousel Images Upload */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C96A2B]" />
                Carousel Images to Brand *
              </h2>
              
              {carouselPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {carouselPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Carousel ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-xl w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCarousel(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#C96A2B]/50 transition-colors">
                <Upload className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-white/60 text-sm">
                  {carouselPreviews.length > 0 ? 'Add more images' : 'Click to upload carousel images'}
                </span>
                <span className="text-white/40 text-xs mt-1">PNG, JPG up to 10MB each</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCarouselUpload}
                  className="hidden"
                />
              </label>
              
              {carouselPreviews.length > 0 && (
                <p className="text-white/50 text-sm mt-3">{carouselPreviews.length} image{carouselPreviews.length > 1 ? 's' : ''} selected</p>
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
              disabled={loading || carouselFiles.length === 0}
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
                  Brand {carouselFiles.length > 1 ? `${carouselFiles.length} Images` : 'Image'} - FREE
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
