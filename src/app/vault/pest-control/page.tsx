'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Play, ChevronLeft, ChevronRight, X, ShoppingBag, Eye, Shield } from 'lucide-react';

const carousels = [
  {
    id: 'roach-warning-sign',
    title: 'One Roach Is A Warning Sign',
    category: 'Roaches',
    slides: 10,
    images: [
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-1.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-2.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-3.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-4.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-5.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-6.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-7.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-8.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-9.PNG',
      '/vault/pest-control/carousels/roach-warning-sign/Roaches-10.PNG',
    ],
    productId: null, // Link to product when available
  },
];

const categories = [
  { name: 'All', count: 1 },
  { name: 'Roaches', count: 1 },
  { name: 'Termites', count: 0 },
  { name: 'Rodents', count: 0 },
  { name: 'Mosquitoes', count: 0 },
  { name: 'Ants', count: 0 },
];

export default function PestControlVaultPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewCarousel, setPreviewCarousel] = useState<typeof carousels[0] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredCarousels = selectedCategory === 'All' 
    ? carousels 
    : carousels.filter(c => c.category === selectedCategory);

  // Disable right-click on the page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Keyboard navigation for preview
  useEffect(() => {
    if (!previewCarousel) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev + 1) % previewCarousel.images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => prev === 0 ? previewCarousel.images.length - 1 : prev - 1);
      } else if (e.key === 'Escape') {
        setPreviewCarousel(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewCarousel]);

  return (
    <div className="min-h-screen bg-[#081F33]">
      {/* Header */}
      <header className="bg-[#081F33] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/industries/pest-control"
              className="text-white/70 hover:text-white text-sm font-medium"
            >
              Back to Store
            </Link>
            <Link 
              href="/industries/pest-control#packages"
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all"
            >
              View Packages
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C96A2B]/20 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Protected Content Vault
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pest Control Content <span className="text-[#C96A2B]">Vault</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Preview our ready-to-customize content. Each piece gets branded with your logo, 
            colors, and contact info before delivery.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                disabled={cat.count === 0}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#C96A2B] text-white'
                    : cat.count === 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {cat.name} {cat.count > 0 && <span className="ml-1 opacity-60">({cat.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filteredCarousels.length === 0 ? (
            <div className="text-center py-20">
              <Lock className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">Coming Soon</h3>
              <p className="text-white/40">Content for this category is being created.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCarousels.map((carousel) => (
                <div 
                  key={carousel.id}
                  className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C96A2B]/50 transition-all"
                >
                  {/* Preview Image with Protection */}
                  <div 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => {
                      setPreviewCarousel(carousel);
                      setCurrentSlide(0);
                    }}
                  >
                    {/* Image with watermark overlay */}
                    <div className="relative w-full h-full select-none pointer-events-none">
                      <Image
                        src={carousel.images[0]}
                        alt={carousel.title}
                        fill
                        className="object-cover"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                      {/* Watermark Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <div className="text-white text-4xl font-bold rotate-[-30deg] whitespace-nowrap">
                          PIPELINE AI
                        </div>
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081F33] via-transparent to-transparent" />
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#C96A2B]/0 group-hover:bg-[#C96A2B]/20 transition-all flex items-center justify-center pointer-events-auto">
                      <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 text-white font-semibold">
                        <Eye className="w-5 h-5" />
                        Preview All {carousel.slides} Slides
                      </div>
                    </div>
                    
                    {/* Slide count badge */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                      {carousel.slides} slides
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <span className="text-xs font-semibold text-[#C96A2B] bg-[#C96A2B]/10 px-3 py-1 rounded-full">
                      {carousel.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3 mb-4">{carousel.title}</h3>
                    <Link
                      href="/industries/pest-control#individual"
                      className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all w-full justify-center"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Get This Customized
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Stand Out on Social Media?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Get professionally designed content customized with your branding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/industries/pest-control#packages"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all"
            >
              View Packages
            </Link>
            <Link
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {previewCarousel && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setPreviewCarousel(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setPreviewCarousel(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Navigation arrows */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(prev => prev === 0 ? previewCarousel.images.length - 1 : prev - 1);
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(prev => (prev + 1) % previewCarousel.images.length);
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          {/* Image container */}
          <div 
            className="relative max-w-3xl max-h-[80vh] aspect-square select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewCarousel.images[currentSlide]}
              alt={`${previewCarousel.title} - Slide ${currentSlide + 1}`}
              fill
              className="object-contain pointer-events-none"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-white/20 text-6xl font-bold rotate-[-30deg] whitespace-nowrap select-none">
                PIPELINE AI
              </div>
            </div>
            
            {/* Slide counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {currentSlide + 1} / {previewCarousel.images.length}
            </div>
          </div>
          
          {/* Thumbnail strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 mt-20" style={{ marginTop: '100px', bottom: '80px' }}>
            {previewCarousel.images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentSlide ? 'border-[#C96A2B]' : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full pointer-events-none"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          
          {/* CTA in modal */}
          <div className="absolute bottom-6 right-6">
            <Link
              href="/industries/pest-control#individual"
              className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#B55D24] transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingBag className="w-5 h-5" />
              Get This Customized
            </Link>
          </div>
        </div>
      )}

      {/* Anti-theft CSS injection */}
      <style jsx global>{`
        .vault-image {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
