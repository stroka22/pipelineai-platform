'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Play,
  ChevronRight,
  Star,
  Zap,
  Download,
  Eye,
  ShoppingBag,
  Package,
  Image as ImageIcon,
  Images,
  Film
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';

const vaultCategories = [
  { name: 'Termite Pack', icon: '🪵', count: 12, slug: 'termites' },
  { name: 'Roach Pack', icon: '🪳', count: 10, slug: 'roaches' },
  { name: 'Rodent Pack', icon: '🐀', count: 10, slug: 'rodents' },
  { name: 'Mosquito Pack', icon: '🦟', count: 8, slug: 'mosquitoes' },
  { name: 'Ant Pack', icon: '🐜', count: 8, slug: 'ants' },
  { name: 'Reels', icon: '🎬', count: 8, slug: 'reels' },
];

const pricing = {
  singleImage: 15,
  fiveSlide: 57,
  tenSlide: 127,
  reel: 97,
  cinematicVideo: 197,
};

export default function PestControlPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'Pest Control')
        .order('is_featured', { ascending: false });
      
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              All Vaults
            </Link>
            <Link href="#content" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Browse Content
            </Link>
            <Link href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </Link>
          </nav>
          <Link 
            href="/vault/pest-control"
            className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Vault
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C96A2B]/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C96A2B]/5 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Pest Control Growth Vault
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Premium Pest Control Content That{' '}
              <span className="text-[#C96A2B]">Builds Authority</span>
            </h1>
            
            <p className="text-xl text-white/60 mb-8 max-w-xl">
              Ready-to-post carousels, reels, and cinematic videos designed to help 
              pest control companies dominate social media.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                href="#content"
                className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
              >
                Browse Content
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/vault/pest-control"
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview Vault
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Instant Download
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Commercial License
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                50+ Assets Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Navigation */}
      <section className="py-8 bg-[#111111] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {vaultCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/vault/pest-control`}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-xl hover:border-[#C96A2B]/50 transition-all group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm group-hover:text-[#C96A2B] transition-colors">{cat.name}</div>
                  <div className="text-white/40 text-xs">{cat.count} assets</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-white/50 text-lg">
              Pay once. Download instantly. Post forever.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#C96A2B]/50 transition-all">
              <div className="w-12 h-12 bg-[#C96A2B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-[#C96A2B]" />
              </div>
              <h3 className="text-white font-bold mb-1">Single Image</h3>
              <p className="text-white/40 text-xs mb-4">Premium social image</p>
              <div className="text-3xl font-bold text-white">${pricing.singleImage}</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#C96A2B]/50 transition-all">
              <div className="w-12 h-12 bg-[#C96A2B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Images className="w-6 h-6 text-[#C96A2B]" />
              </div>
              <h3 className="text-white font-bold mb-1">5-Slide Carousel</h3>
              <p className="text-white/40 text-xs mb-4">Growth carousel</p>
              <div className="text-3xl font-bold text-white">${pricing.fiveSlide}</div>
            </div>
            
            <div className="bg-[#C96A2B]/10 border border-[#C96A2B]/30 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="w-12 h-12 bg-[#C96A2B]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-[#C96A2B]" />
              </div>
              <h3 className="text-white font-bold mb-1">10-Slide Carousel</h3>
              <p className="text-white/40 text-xs mb-4">Premium authority</p>
              <div className="text-3xl font-bold text-white">${pricing.tenSlide}</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#C96A2B]/50 transition-all">
              <div className="w-12 h-12 bg-[#C96A2B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-[#C96A2B]" />
              </div>
              <h3 className="text-white font-bold mb-1">AI Reel</h3>
              <p className="text-white/40 text-xs mb-4">Short-form video</p>
              <div className="text-3xl font-bold text-white">${pricing.reel}</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#C96A2B]/50 transition-all">
              <div className="w-12 h-12 bg-[#C96A2B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Film className="w-6 h-6 text-[#C96A2B]" />
              </div>
              <h3 className="text-white font-bold mb-1">Cinematic Video</h3>
              <p className="text-white/40 text-xs mb-4">15-sec commercial</p>
              <div className="text-3xl font-bold text-white">${pricing.cinematicVideo}</div>
            </div>
          </div>
          
          {/* Bundle Offer */}
          <div className="bg-gradient-to-r from-[#C96A2B]/20 to-[#C96A2B]/5 border border-[#C96A2B]/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              BUNDLE DEAL
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Buy Any 2 Premium 10-Slide Carousels, Get 1 Free
            </h3>
            <p className="text-white/60 mb-6">
              Stack your content library and save $127
            </p>
            <Link 
              href="/vault/pest-control"
              className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all"
            >
              Browse & Build Bundle
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section id="content" className="py-20 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Browse Growth Content
              </h2>
              <p className="text-white/50">
                Premium pest control social media assets
              </p>
            </div>
            <Link 
              href="/vault/pest-control"
              className="hidden md:flex items-center gap-2 text-[#C96A2B] font-semibold hover:gap-3 transition-all"
            >
              Preview All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C96A2B]"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C96A2B]/50 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#C96A2B]/20 to-[#081F33] flex items-center justify-center relative">
                    <span className="text-7xl opacity-40 group-hover:opacity-60 transition-opacity">
                      {product.product_type === 'reel' ? '🎬' : '🪲'}
                    </span>
                    {product.is_featured && (
                      <div className="absolute top-4 left-4 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" fill="white" />
                        FEATURED
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
                      {product.items_count} {product.product_type === 'carousel' ? 'slides' : 'sec'}
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-[#C96A2B] uppercase">
                      {product.product_type.replace('_', ' ')}
                    </span>
                    <h3 className="text-white font-bold text-lg mt-1 mb-2">{product.title}</h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">${product.price}</span>
                        {product.sale_price && (
                          <span className="text-sm text-white/40 line-through ml-2">${product.sale_price}</span>
                        )}
                      </div>
                      {product.stripe_link ? (
                        <Link
                          href={product.stripe_link}
                          className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#B55D24] transition-all flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Buy Now
                        </Link>
                      ) : (
                        <Link
                          href="/vault/pest-control"
                          className="bg-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-white/50 mb-6">Products coming soon! Preview the vault to see what&apos;s available.</p>
              <Link
                href="/vault/pest-control"
                className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B55D24] transition-all"
              >
                <Eye className="w-5 h-5" />
                Preview Vault
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/50 text-lg">
              From browsing to posting in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                icon: Eye,
                title: 'Browse & Preview', 
                desc: 'Explore pest control carousels, reels, and videos in the vault' 
              },
              { 
                step: '02', 
                icon: ShoppingBag,
                title: 'Purchase Content', 
                desc: 'One-time payment via Stripe. No subscriptions required.' 
              },
              { 
                step: '03', 
                icon: Download,
                title: 'Download & Post', 
                desc: 'Get instant access to high-res files ready for social media' 
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[#C96A2B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-[#C96A2B]" />
                </div>
                <div className="text-4xl font-extrabold text-white/10 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Videos */}
      <section className="py-20 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Cinematic AI Video Commercials
              </h2>
              <p className="text-white/50">
                15-second premium video ads for pest control
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Termite Damage Warning', price: 197 },
              { title: 'Emergency Pest Response', price: 197 },
              { title: 'Family Protection Ad', price: 197 },
            ].map((video, i) => (
              <div 
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C96A2B]/50 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-[#C96A2B]/30 to-[#081F33] flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                    15 sec
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[#C96A2B]">CINEMATIC VIDEO</span>
                  <h3 className="text-white font-bold mt-1 mb-3">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">${video.price}</span>
                    <button className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#B55D24] transition-all">
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Build Authority. Increase Engagement.{' '}
            <span className="text-[#C96A2B]">Grow Faster.</span>
          </h2>
          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            Stop wasting time creating content. Get premium, ready-to-post pest control 
            growth content designed to make your company stand out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/vault/pest-control"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
            >
              Browse Pest Control Vault
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white/40 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="text-2xl font-bold text-white">
              Pipeline <span className="text-[#C96A2B]">AI</span>
            </Link>
            <p className="text-sm text-center md:text-left">
              Premium Social Media Growth Content for Local Businesses
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} Pipeline AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
