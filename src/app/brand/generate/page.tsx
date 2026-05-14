'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Download, CheckCircle, XCircle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

function GenerateContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'generating' | 'success' | 'error'>('loading');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('Verifying payment...');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setStatus('error');
      return;
    }

    generateBrandedImage();
  }, [sessionId]);

  async function generateBrandedImage() {
    try {
      setStatus('generating');
      setProgress('Analyzing your image...');

      // Get the branding data from sessionStorage
      const brandingDataStr = sessionStorage.getItem('brandingData');
      if (!brandingDataStr) {
        throw new Error('Branding data not found. Please try again.');
      }

      const brandingData = JSON.parse(brandingDataStr);

      setProgress('Creating your branded image with AI...');

      const response = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          carouselImage: brandingData.carouselImage,
          logoImage: brandingData.logoImage,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setStatus('success');
        // Clear the stored data
        sessionStorage.removeItem('brandingData');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `branded-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
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
            <h2 className="text-2xl font-bold text-white mb-4">Creating Your Branded Image</h2>
            <p className="text-white/60 mb-4">{progress}</p>
            <p className="text-white/40 text-sm">This usually takes 20-40 seconds...</p>
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
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Your Branded Image is Ready!</h1>
            <p className="text-white/60">Download your AI-branded carousel image below</p>
          </div>

          {imageUrl && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="relative aspect-square max-w-lg mx-auto rounded-xl overflow-hidden mb-6">
                <Image
                  src={imageUrl}
                  alt="Branded image"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-[#C96A2B] text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#B55D24] transition-all"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>
            </div>
          )}

          <div className="text-center space-y-4">
            <Link
              href="/brand"
              className="inline-flex items-center gap-2 text-[#C96A2B] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Brand Another Image
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
