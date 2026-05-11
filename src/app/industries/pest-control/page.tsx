'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Download,
  Eye,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, VaultItem, Category } from '@/lib/supabase';
import Image from 'next/image';

export default function PestControlPage() {
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
          .eq('niche', 'pest-control')
          .order('display_order'),
        supabase
          .from('categories')
          .select('*')
          .eq('niche_slug', 'pest-control')
          .eq('is_active', true)
          .order('display_order')
      ]);
      
      if (itemsRes.data) setVaultItems(itemsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    }
    fetchData();
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
            <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Home
            </Link>
            <Link href="/#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              All Vaults
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
              Ready-to-post carousels and growth content designed to help 
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
                Preview with Watermarks
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
                {vaultItems.length} Items Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Buttons */}
      <section className="py-12 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Browse by Category</h2>
            <Link 
              href="/vault/pest-control"
              className="text-[#C96A2B] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/vault/pest-control?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-[#C96A2B]/50 rounded-xl px-5 py-3 transition-all group"
              >
                <span className="text-2xl">{cat.icon || '📁'}</span>
                <span className="text-white font-semibold text-sm group-hover:text-[#C96A2B] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section id="content" className="py-20 bg-[#111111]">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C96A2B]"></div>
            </div>
          ) : vaultItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaultItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C96A2B]/50 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#C96A2B]/20 to-[#081F33] relative overflow-hidden">
                    {item.images[0] && (
                      <Image 
                        src={item.images[0]} 
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                    <div className="absolute top-4 left-4 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {item.content_type === 'image' ? 'Single Image' : `${item.slide_count} Slides`}
                    </div>
                    {item.price && (
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-lg font-bold px-3 py-1 rounded-full">
                        ${item.price}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-[#C96A2B] uppercase">{item.category}</span>
                    <h3 className="text-white font-bold text-lg mt-1 mb-4">{item.title}</h3>
                    <div className="flex gap-3">
                      <Link
                        href="/vault/pest-control"
                        className="flex-1 bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Link>
                      {item.stripe_link ? (
                        <Link
                          href={item.stripe_link}
                          className="flex-1 bg-[#C96A2B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#B55D24] transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Buy Now
                        </Link>
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
          
          <Link 
            href="#content"
            className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
          >
            Browse Content
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
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
