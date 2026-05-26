'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Check, ChevronLeft, ChevronRight, Star, Crown, Zap } from 'lucide-react';

interface GalleryItem {
  id: string;
  niche: string;
  type: string;
  title: string;
  images: string[];
  caption: string;
  display_order: number;
}

const PACKAGES = [
  {
    name: 'Branding Essentials',
    price: '$497',
    period: '/month',
    icon: Zap,
    description: 'Consistent branded presence that builds recognition',
    features: [
      '8 branded posts/month',
      '2 carousels/month',
      'Captions included',
      'Consistent branding',
      'Basic strategy support',
    ],
    cta: 'Start Branding',
    popular: false,
    color: 'from-slate-600 to-slate-700',
    border: 'border-white/10',
  },
  {
    name: 'Growth Branding',
    price: '$997',
    period: '/month',
    icon: Star,
    description: 'Full content engine that drives engagement and leads',
    features: [
      '16–20 posts/month',
      '4 carousels/month',
      'Reels & motion content',
      'Educational content',
      'Seasonal campaigns',
      'Captions included',
      'Monthly planning',
      'Profile optimization',
    ],
    cta: 'Accelerate Growth',
    popular: true,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/50',
  },
  {
    name: 'Authority Branding',
    price: '$1,997–2,500+',
    period: '/month',
    icon: Crown,
    description: 'Dominant market presence that positions you as THE authority',
    features: [
      'Daily content',
      'Advanced reels & carousels',
      'Listing promotions',
      'Luxury branding campaigns',
      'Story content',
      'Priority turnaround',
      'Growth strategy support',
    ],
    cta: 'Claim Authority',
    popular: false,
    color: 'from-amber-600 to-yellow-700',
    border: 'border-amber-500/30',
  },
];

const CALENDLY_URL = 'https://calendly.com/getpipelineai-support/30min';

export default function RealEstatePageClient({ singles, carousels }: { singles: GalleryItem[]; carousels: GalleryItem[] }) {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<Record<string, number>>({});

  const getCarouselIndex = (id: string) => activeCarouselIndex[id] || 0;

  const nextSlide = (id: string, total: number) => {
    setActiveCarouselIndex(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 >= total ? 0 : (prev[id] || 0) + 1 }));
  };

  const prevSlide = (id: string) => {
    setActiveCarouselIndex(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 < 0 ? 0 : (prev[id] || 0) - 1 }));
  };

  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#050a14]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(234,179,8,0.08),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 text-sm font-medium">Real Estate Authority Branding</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Dominate Your
              <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-amber-300 bg-clip-text text-transparent">
                Local Market
              </span>
            </h1>
            
            <p className="text-xl text-white/60 leading-relaxed mb-8 max-w-2xl">
              Premium branded content that positions you as the go-to real estate authority in your area. 
              Professional carousels, posts, and campaigns — designed to make you impossible to ignore.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                <Calendar className="w-5 h-5" />
                Book Strategy Call
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                View Gallery
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Real Estate Posts Created' },
              { value: '50+', label: 'Carousels Designed' },
              { value: '25+', label: 'Agents Served' },
              { value: '3x', label: 'Average Engagement Increase' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Content Gallery</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Browse our collection of real estate branded content. Every piece is designed to stop the scroll and build authority.
          </p>
        </div>

        {/* Single Images */}
        {singles.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-blue-500 rounded-full" />
              <h3 className="text-2xl font-bold text-white">Single Posts</h3>
              <span className="text-white/30 text-sm ml-2">{singles.length} items</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {singles.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                  {item.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.images[0]} alt={item.title || 'Real estate post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {item.title && <p className="text-white text-sm font-medium">{item.title}</p>}
                      {item.caption && <p className="text-white/60 text-xs mt-1 line-clamp-2">{item.caption}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carousels */}
        {carousels.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-amber-500 rounded-full" />
              <h3 className="text-2xl font-bold text-white">Carousels</h3>
              <span className="text-white/30 text-sm ml-2">{carousels.length} items</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carousels.map((item) => {
                const idx = getCarouselIndex(item.id);
                return (
                  <div key={item.id} className="group bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                    {/* Carousel Preview */}
                    <div className="relative aspect-square bg-white/5">
                      {item.images[idx] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[idx]} alt={`${item.title || 'Carousel'} - Slide ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      
                      {/* Navigation */}
                      {item.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevSlide(item.id)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-1.5 rounded-full text-white/70 hover:text-white transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => nextSlide(item.id, item.images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-1.5 rounded-full text-white/70 hover:text-white transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Slide counter */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/70">
                        {idx + 1} / {item.images.length}
                      </div>

                      {/* Dot indicators */}
                      {item.images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 translate-y-6">
                          {item.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveCarouselIndex(prev => ({ ...prev, [item.id]: i }))}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/30'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {item.title && <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>}
                      {item.caption && <p className="text-white/40 text-xs line-clamp-2">{item.caption}</p>}
                      <div className="text-white/20 text-xs mt-2">{item.images.length} slides</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state when no gallery items */}
        {singles.length === 0 && carousels.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">📷</div>
            <h3 className="text-white/40 text-lg font-medium mb-2">Gallery Coming Soon</h3>
            <p className="text-white/25 text-sm">We&apos;re curating our best real estate content. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.05),transparent_70%)]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Branding Packages</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Choose the level of presence that matches your ambitions. Every package includes strategy support and premium branded content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative bg-white/[0.03] border ${pkg.border} rounded-2xl p-8 transition-all hover:bg-white/[0.05] ${
                  pkg.popular ? 'ring-1 ring-blue-500/30 scale-[1.02]' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center mb-6`}>
                  <pkg.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-white/40 text-sm mb-4">{pkg.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{pkg.price}</span>
                  <span className="text-white/40">{pkg.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {pkg.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-white/30 text-sm mt-8">
            All packages include a strategy call to align on your brand, market, and goals.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Own Your Market?
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Stop blending in. Get branded content that makes you the obvious choice for buyers and sellers in your area.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Calendar className="w-5 h-5" />
            Book Your Strategy Call
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <Link href="/" className="text-white/40 hover:text-white text-sm">
            ← Pipeline AI
          </Link>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
            Book a Call →
          </a>
        </div>
      </footer>
    </div>
  );
}
