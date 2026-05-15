'use client';

import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Download, CheckCircle, XCircle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

function GenerateContent() {
  const [status, setStatus] = useState<'loading' | 'generating' | 'success' | 'error'>('loading');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('Loading...');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  console.log('GenerateContent mounted, status:', status);

  useEffect(() => {
    console.log('useEffect running');
    generateBrandedImages();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  async function generateBrandedImages() {
    try {
      setStatus('generating');
      console.log('Starting generation...');

      // Get the branding data from sessionStorage
      const brandingDataStr = sessionStorage.getItem('brandingData');
      console.log('brandingDataStr exists:', !!brandingDataStr);
      
      if (!brandingDataStr) {
        throw new Error('Branding data not found. Please go back and submit the form again.');
      }

      const brandingData = JSON.parse(brandingDataStr);
      console.log('brandingData keys:', Object.keys(brandingData));
      
      const carouselImages = brandingData.carouselImages || (brandingData.carouselImage ? [brandingData.carouselImage] : []);
      console.log('carouselImages count:', carouselImages.length);
      
      if (carouselImages.length === 0) {
        throw new Error('No carousel images found. Please go back and upload images.');
      }
      
      setTotalImages(carouselImages.length);

      const results: string[] = [];

      for (let i = 0; i < carouselImages.length; i++) {
        setCurrentIndex(i + 1);
        setProgress(`Creating image ${i + 1} of ${carouselImages.length}...`);

        console.log(`Generating image ${i + 1}...`);
        
        const response = await fetch('/api/brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carouselImage: carouselImages[i],
            logoImage: brandingData.logoImage,
            businessName: brandingData.businessName,
            websiteUrl: brandingData.websiteUrl,
            phoneNumber: brandingData.phoneNumber,
            primaryColor: brandingData.primaryColor,
            secondaryColor: brandingData.secondaryColor,
          }),
        });

        console.log(`Response status for image ${i + 1}:`, response.status);
        const data = await response.json();
        console.log(`Response data for image ${i + 1}:`, data.success, data.error);

        if (data.success && data.imageUrl) {
          results.push(data.imageUrl);
          setGeneratedImages([...results]);
        } else {
          console.error(`Failed to generate image ${i + 1}:`, data.error, data.details);
        }
      }

      if (results.length === 0) {
        throw new Error('Failed to generate any images');
      }

      setStatus('success');
      sessionStorage.removeItem('brandingData');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      // Handle base64 data URLs
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

  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      await handleDownload(generatedImages[i], i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (status === 'loading' || status === 'generating') {
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
            <h2 className="text-2xl font-bold text-white mb-4">Creating Your Branded Images</h2>
            <p className="text-white/60 mb-4">{progress}</p>
            {totalImages > 1 && (
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div 
                  className="bg-[#C96A2B] h-2 rounded-full transition-all"
                  style={{ width: `${(currentIndex / totalImages) * 100}%` }}
                />
              </div>
            )}
            <p className="text-white/40 text-sm">Each image takes 20-40 seconds...</p>
            
            {generatedImages.length > 0 && (
              <div className="mt-8">
                <p className="text-green-400 text-sm mb-2">{generatedImages.length} image{generatedImages.length > 1 ? 's' : ''} completed</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md px-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h2>
            <p className="text-white/60 mb-8">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#C96A2B] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B55D24] transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <Link
                href="/brand"
                className="block w-full border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Branded {generatedImages.length > 1 ? 'Images Are' : 'Image is'} Ready!
            </h1>
            <p className="text-white/60">Download your AI-branded carousel {generatedImages.length > 1 ? 'images' : 'image'} below</p>
          </div>

          {generatedImages.length > 1 && (
            <div className="text-center mb-8">
              <button
                onClick={handleDownloadAll}
                className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center gap-2 hover:bg-[#B55D24] transition-all"
              >
                <Download className="w-5 h-5" />
                Download All ({generatedImages.length} images)
              </button>
            </div>
          )}

          <div className={`grid ${generatedImages.length === 1 ? 'max-w-lg mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mb-8`}>
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <Image
                    src={imageUrl}
                    alt={`Branded image ${index + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <button
                  onClick={() => handleDownload(imageUrl, index)}
                  className="w-full bg-[#C96A2B] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B55D24] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download {generatedImages.length > 1 ? `#${index + 1}` : 'Image'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Link
              href="/brand"
              className="inline-flex items-center gap-2 text-[#C96A2B] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Brand More Images
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C96A2B] animate-spin" />
      </main>
    }>
      <GenerateContent />
    </Suspense>
  );
}
