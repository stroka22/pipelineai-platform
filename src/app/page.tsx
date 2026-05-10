'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Play, ShoppingBag, Zap, ChevronRight, Eye, Star, Package, Film, Images, Image as ImageIcon, CheckCircle } from 'lucide-react';

const industryVaults = [
  {
    name: 'Pest Control Growth Vault',
    slug: 'pest-control',
    image: '🪲',
    assetCount: 60,
    available: true,
    popular: true,
  },
  {
    name: 'Roofing Growth Vault',
    slug: 'roofing',
    image: '🏠',
    assetCount: 50,
    available: true,
    popular: false,
  },
  {
    name: 'HVAC Growth Vault',
    slug: 'hvac',
    image: '❄️',
    assetCount: 40,
    available: true,
    popular: false,
  },
  {
    name: 'Med Spa Growth Vault',
    slug: 'med-spa',
    image: '💆',
    assetCount: 0,
    available: false,
    popular: false,
  },
  {
    name: 'Mortgage Growth Vault',
    slug: 'mortgage',
    image: '🏦',
    assetCount: 0,
    available: false,
    popular: false,
  },
  {
    name: 'Real Estate Growth Vault',
    slug: 'real-estate',
    image: '🔑',
    assetCount: 0,
    available: false,
    popular: false,
  },
];

const bestSellers = [
  {
    title: 'Termite Warning Signs',
    category: 'Pest Control',
    type: '10-Slide Carousel',
    price: 127,
    image: '🪵',
  },
  {
    title: 'Roach Prevention Tips',
    category: 'Pest Control',
    type: '10-Slide Carousel',
    price: 127,
    image: '🪳',
  },
  {
    title: 'Storm Damage Inspection',
    category: 'Roofing',
    type: '10-Slide Carousel',
    price: 127,
    image: '🏠',
  },
  {
    title: 'AC Maintenance Guide',
    category: 'HVAC',
    type: '10-Slide Carousel',
    price: 127,
    image: '❄️',
  },
];

const pricing = [
  {
    icon: ImageIcon,
    name: 'Single Image',
    price: 15,
    description: 'One premium social media image',
  },
  {
    icon: Images,
    name: '5-Slide Growth Carousel',
    price: 57,
    description: 'Educational carousel pack',
  },
  {
    icon: Package,
    name: '10-Slide Growth Carousel',
    price: 127,
    description: 'Premium authority carousel',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Industry Vaults
            </Link>
            <Link href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </Link>
            <Link href="/vault/pest-control" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Browse Content
            </Link>
          </nav>
          <Link 
            href="/industries/pest-control"
            className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all"
          >
            Shop Now
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
            Ready-to-post carousels, reels, cinematic videos, and industry growth vaults 
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
            <Link 
              href="/vault/pest-control"
              className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              View Growth Content
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
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
              Ready to Post
            </span>
          </div>
        </div>
      </section>

      {/* Featured Industry Vaults */}
      <section id="vaults" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Industry Growth Vaults
              </h2>
              <p className="text-white/50">
                Premium content libraries for your industry
              </p>
            </div>
            <Link 
              href="/vault/pest-control"
              className="hidden md:flex items-center gap-2 text-[#C96A2B] font-semibold hover:gap-3 transition-all"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industryVaults.map((vault) => (
              <div 
                key={vault.slug}
                className={`relative rounded-2xl p-8 transition-all group ${
                  vault.available 
                    ? 'bg-white/5 border border-white/10 hover:border-[#C96A2B]/50 cursor-pointer' 
                    : 'bg-white/[0.02] border border-white/5'
                }`}
              >
                {vault.popular && (
                  <div className="absolute -top-3 right-6 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" fill="white" />
                    POPULAR
                  </div>
                )}
                
                <div className="text-5xl mb-6">{vault.image}</div>
                
                <h3 className={`text-xl font-bold mb-2 ${vault.available ? 'text-white' : 'text-white/40'}`}>
                  {vault.name}
                </h3>
                
                <p className={`text-sm mb-6 ${vault.available ? 'text-white/50' : 'text-white/30'}`}>
                  {vault.available ? `${vault.assetCount}+ assets available` : 'Coming Soon'}
                </p>
                
                {vault.available ? (
                  <div className="flex gap-3">
                    <Link 
                      href={`/vault/${vault.slug}`}
                      className="flex-1 bg-white/5 border border-white/10 text-white py-2.5 rounded-lg font-medium text-sm text-center hover:bg-white/10 transition-all"
                    >
                      Preview
                    </Link>
                    <Link 
                      href={`/industries/${vault.slug}`}
                      className="flex-1 bg-[#C96A2B] text-white py-2.5 rounded-lg font-medium text-sm text-center hover:bg-[#B55D24] transition-all"
                    >
                      Shop Vault
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white/5 text-white/30 py-2.5 rounded-lg font-medium text-sm text-center">
                    Notify Me
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Growth Content */}
      <section className="py-20 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Best Selling Growth Content
              </h2>
              <p className="text-white/50">
                Top-performing social media assets
              </p>
            </div>
            <Link 
              href="/industries/pest-control"
              className="hidden md:flex items-center gap-2 text-[#C96A2B] font-semibold hover:gap-3 transition-all"
            >
              Shop All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((item, i) => (
              <div 
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C96A2B]/50 transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-[#C96A2B]/20 to-[#081F33] flex items-center justify-center relative">
                  <span className="text-6xl opacity-50 group-hover:opacity-70 transition-opacity">{item.image}</span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[#C96A2B]">{item.type}</span>
                  <h3 className="text-white font-bold mt-1 mb-3">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">${item.price}</span>
                    <button className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#B55D24] transition-all flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                title: 'Browse Vault', 
                desc: 'Explore industry-specific content packs, carousels, reels, and cinematic videos' 
              },
              { 
                step: '02', 
                icon: ShoppingBag,
                title: 'Purchase Content', 
                desc: 'One-time payment via Stripe. No subscriptions. Own it forever.' 
              },
              { 
                step: '03', 
                icon: Zap,
                title: 'Post & Grow', 
                desc: 'Download instantly and post to build authority, trust, and engagement' 
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-white/50 text-lg">
              Pay once. Download instantly. Post forever.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {pricing.map((item, i) => (
              <div 
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#C96A2B]/50 transition-all"
              >
                <div className="w-12 h-12 bg-[#C96A2B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[#C96A2B]" />
                </div>
                <h3 className="text-white font-bold mb-1">{item.name}</h3>
                <p className="text-white/40 text-xs mb-4">{item.description}</p>
                <div className="text-3xl font-bold text-white">${item.price}</div>
              </div>
            ))}
          </div>
          
          {/* Bundle Offer */}
          <div className="bg-gradient-to-r from-[#C96A2B]/20 to-[#C96A2B]/5 border border-[#C96A2B]/30 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              BUNDLE & SAVE
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Buy Any 2 Premium 10-Slide Carousels, Get 1 Free
            </h3>
            <p className="text-white/60 mb-6">
              Stack your content library and save $127
            </p>
            <Link 
              href="/industries/pest-control"
              className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all"
            >
              Shop Bundle Deal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Build Authority. Increase Engagement.{' '}
            <span className="text-[#C96A2B]">Grow Faster.</span>
          </h2>
          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            Stop wasting time creating content from scratch. Get premium, ready-to-post 
            growth content designed to make your business stand out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/vault/pest-control"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all inline-flex items-center justify-center gap-2 group"
            >
              Browse Growth Content
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/industries/pest-control"
              className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Pest Control Vault
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
