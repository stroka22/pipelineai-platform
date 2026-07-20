'use client';

import Link from 'next/link';
import SocialLinks from '@/components/SocialLinks';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Download,
  Eye,
  ShoppingBag,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, VaultItem, Category } from '@/lib/supabase';
import Image from 'next/image';
import BuyButton from '@/components/BuyButton';
import AddToCartButton from '@/components/AddToCartButton';
import Header from '@/components/Header';

interface IndustryPageProps {
  niche: string;
  nicheSlug: string;
  tagline: string;
  description: string;
}

export default function IndustryPage({ niche, nicheSlug, tagline, description }: IndustryPageProps) {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [itemsRes, catsRes] = await Promise.all([
        supabase
          .from('vault_items')
          .select('*')
          .eq('is_active', true)
          .eq('niche', nicheSlug)
          .order('display_order'),
        supabase
          .from('categories')
          .select('*')
          .eq('niche_slug', nicheSlug)
          .eq('is_active', true)
          .order('display_order')
      ]);
      
      if (itemsRes.data) setVaultItems(itemsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    }
    fetchData();
  }, [nicheSlug]);

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header currentNiche={nicheSlug} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              {niche} Growth Vault
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Premium {niche} Content That{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{tagline}</span>
            </h1>
            
            <p className="text-xl text-white/50 mb-8 max-w-xl">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                href="#content"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition-all inline-flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
              >
                Browse Content
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href={`/vault/${nicheSlug}`}
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview with Watermarks
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400" />
                Instant Download
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400" />
                Download Link Emailed
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400" />
                {vaultItems.length} Items Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Buttons */}
      {categories.length > 0 && (
        <section className="py-12 bg-[#030712] border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Browse by Category</h2>
              <Link 
                href={`/vault/${nicheSlug}`}
                className="text-blue-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/vault/${nicheSlug}?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-xl px-5 py-3 transition-all group"
                >
                  <span className="text-2xl">{cat.icon || '📁'}</span>
                  <span className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Grid */}
      <section id="content" className="py-20 bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Browse & Buy
            </h2>
            <p className="text-white/50 text-lg">
              Click any item to preview, then buy and download instantly
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : vaultItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaultItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#0d1423] border border-white/10 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 relative overflow-hidden">
                    {item.images[0] && (
                      <Image 
                        src={item.images[0]} 
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable={false}
                      />
                    )}
                    {/* Tiled watermark pattern */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                      <div className="absolute inset-0 flex flex-col justify-around py-2">
                        {[0, 1, 2, 3].map((row) => (
                          <div key={row} className="flex justify-around">
                            {[0, 1, 2].map((col) => (
                              <div 
                                key={col} 
                                className="text-white font-black rotate-[-30deg] whitespace-nowrap text-sm"
                                style={{ 
                                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                  opacity: 0.4
                                }}
                              >
                                PREVIEW
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                    <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {item.content_type === 'image' ? 'Single Image' : `${item.slide_count} Slides`}
                    </div>
                    {item.price && (
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-lg font-bold px-3 py-1 rounded-full">
                        ${item.price}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-blue-400 uppercase">{item.category}</span>
                    <h3 className="text-white font-bold text-lg mt-1 mb-4">{item.title}</h3>
                    <div className="flex gap-3">
                      <Link
                        href={`/vault/${nicheSlug}?preview=${item.id}`}
                        className="flex-1 bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Link>
                      {item.price ? (
                        <>
                          <AddToCartButton 
                            item={item} 
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                          />
                          <BuyButton 
                            vaultItemId={item.id} 
                            price={item.price} 
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                          />
                        </>
                      ) : (
                        <span className="flex-1 bg-white/5 text-white/50 px-4 py-2.5 rounded-lg text-sm font-semibold text-center">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-white/50 mb-6">No content available yet. Check back soon!</p>
              <Link
                href={`/vault/${nicheSlug}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all"
              >
                <Eye className="w-5 h-5" />
                Preview Vault
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#030712]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/50 text-lg">
              From browsing to posting in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: '01', 
                icon: Eye,
                title: 'Preview Content', 
                desc: 'Browse watermarked previews to see what you\'re getting' 
              },
              { 
                step: '02', 
                icon: ShoppingBag,
                title: 'Buy Instantly', 
                desc: 'One-time payment via Stripe. No subscriptions.' 
              },
              { 
                step: '03', 
                icon: Mail,
                title: 'Get Email', 
                desc: 'Receive download link via email for future access' 
              },
              { 
                step: '04', 
                icon: Download,
                title: 'Download & Post', 
                desc: 'Get high-res files ready for social media' 
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white/10 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Branding Tool - Hidden until perfected
      <section className="py-16 bg-[#030712]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Add Your Branding to Any Carousel</h3>
                <p className="text-white/50 mb-4">
                  Use our Branding Tool to add your business name, phone number, and website to any carousel image. AI matches your brand style automatically.
                </p>
                <Link 
                  href="/brand"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Try Branding Tool - FREE
                </Link>
              </div>
              <div className="text-8xl">🎨</div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Final CTA */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Content Advantage?</span>
          </h2>
          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            Stop wasting time creating content. Get premium, ready-to-post {niche.toLowerCase()} 
            growth content designed to make your company stand out.
          </p>
          
          <Link 
            href="#content"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition-all inline-flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
          >
            Browse Content
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030712] text-white/40 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-1">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">PIPELINE</span>
              <span className="text-white">AI</span>
            </Link>
            <p className="text-sm text-center md:text-left">
              Smarter Content. Stronger Brands.
            </p>
            <a href="tel:1-888-247-7818" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
              Call or text: 1-888-247-7818
            </a>
            <a href="mailto:Support@GetPipelineAI.com" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
              Support@GetPipelineAI.com
            </a>
            <SocialLinks />
            <p className="text-xs">
              © {new Date().getFullYear()} Pipeline AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
