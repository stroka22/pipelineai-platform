'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag, Zap, ChevronRight, Eye, Star, CheckCircle, ChevronDown, Mail } from 'lucide-react';
import { supabase, Niche } from '@/lib/supabase';

export default function HomePage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [nicheCounts, setNicheCounts] = useState<Record<string, number>>({});
  const [showNicheMenu, setShowNicheMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch active niches
      const { data: nicheData } = await supabase
        .from('niches')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (nicheData) setNiches(nicheData);

      // Fetch vault item counts per niche
      const { data: vaultItems } = await supabase
        .from('vault_items')
        .select('niche')
        .eq('is_active', true);
      
      if (vaultItems) {
        const counts: Record<string, number> = {};
        vaultItems.forEach(item => {
          counts[item.niche] = (counts[item.niche] || 0) + 1;
        });
        setNicheCounts(counts);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const getNicheEmoji = (niche: Niche) => {
    // Use icon from database if set, otherwise fallback
    if (niche.icon) return niche.icon;
    const fallbacks: Record<string, string> = {
      'pest-control': '🪲',
      'roofing': '🏠',
      'hvac': '❄️',
      'plumbing': '🔧',
    };
    return fallbacks[niche.slug] || '📦';
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <div className="relative">
              <button 
                onClick={() => setShowNicheMenu(!showNicheMenu)}
                className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
              >
                Niches
                <ChevronDown className="w-4 h-4" />
              </button>
              {showNicheMenu && (
                <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg py-2 min-w-[200px] shadow-xl">
                  {niches.map(niche => (
                    <Link
                      key={niche.slug}
                      href={`/industries/${niche.slug}`}
                      className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 text-sm"
                      onClick={() => setShowNicheMenu(false)}
                    >
                      {getNicheEmoji(niche)} {niche.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Vaults
            </Link>
            <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              How It Works
            </Link>
          </nav>
          <Link 
            href="#vaults"
            className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all"
          >
            Browse Vaults
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C96A2B]/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C96A2B]/5 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            Premium Social Media Growth Content for Businesses
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Growth Content That Makes You{' '}
            <span className="text-[#C96A2B]">The Obvious Choice</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-3xl mx-auto leading-relaxed">
            Ready-to-post carousels, reels, and growth content 
            designed to help your business stand out online.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="#vaults"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
            >
              Browse Industry Vaults
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-white/40 text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Instant Download
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Commercial License
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Download Link Emailed
            </span>
          </div>
        </div>
      </section>

      {/* Industry Vaults */}
      <section id="vaults" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Industry Growth Vaults
            </h2>
            <p className="text-white/50">
              Premium content libraries tailored to your industry
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C96A2B]"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {niches.map((niche) => (
                <div 
                  key={niche.slug}
                  className="relative rounded-2xl p-8 bg-white/5 border border-white/10 hover:border-[#C96A2B]/50 transition-all group"
                >
                  {niche.slug === 'pest-control' && (
                    <div className="absolute -top-3 right-6 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" fill="white" />
                      POPULAR
                    </div>
                  )}
                  
                  <div className="text-5xl mb-6">{getNicheEmoji(niche)}</div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {niche.name} Growth Vault
                  </h3>
                  
                  <p className="text-sm text-white/50 mb-6">
                    {nicheCounts[niche.slug] || 0} items available
                  </p>
                  
                  <div className="flex gap-3">
                    <Link 
                      href={`/vault/${niche.slug}`}
                      className="flex-1 bg-white/5 border border-white/10 text-white py-2.5 rounded-lg font-medium text-sm text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Link>
                    <Link 
                      href={`/industries/${niche.slug}`}
                      className="flex-1 bg-[#C96A2B] text-white py-2.5 rounded-lg font-medium text-sm text-center hover:bg-[#B55D24] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Shop
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#111111]">
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
                desc: 'Browse watermarked previews in your industry vault' 
              },
              { 
                step: '02', 
                icon: ShoppingBag,
                title: 'Purchase', 
                desc: 'One-time payment via Stripe. No subscriptions.' 
              },
              { 
                step: '03', 
                icon: Mail,
                title: 'Get Download Link', 
                desc: 'Receive email with your download link instantly' 
              },
              { 
                step: '04', 
                icon: Zap,
                title: 'Post & Grow', 
                desc: 'Download and post to build authority and engagement' 
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-[#C96A2B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-[#C96A2B]" />
                </div>
                <div className="text-3xl font-extrabold text-white/10 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Offer */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#C96A2B]/20 to-[#C96A2B]/5 border border-[#C96A2B]/30 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              BUNDLE & SAVE
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Buy Any 2 Premium 10-Slide Carousels, Get 1 Free
            </h3>
            <p className="text-white/60 mb-6">
              Stack your content library and save big
            </p>
            <Link 
              href="#vaults"
              className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all"
            >
              Browse Vaults
              <ArrowRight className="w-5 h-5" />
            </Link>
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
            Stop wasting time creating content from scratch. Get premium, ready-to-post 
            growth content designed to make your business stand out.
          </p>
          
          <Link 
            href="#vaults"
            className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
          >
            Browse Industry Vaults
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
