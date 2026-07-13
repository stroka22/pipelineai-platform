'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Zap, 
  Eye, 
  Star, 
  CheckCircle, 
  Play,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  BarChart3,
  Briefcase,
  Building2,
  Stethoscope,
  Home,
  Car,
  Bug,
  DollarSign,
  Snowflake,
  Wrench,
  Scissors,
  Calendar,
  Phone
} from 'lucide-react';
import { supabase, Niche } from '@/lib/supabase';
import Header from '@/components/Header';

// Platform icons as simple components
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface PreviewItem {
  id: string;
  title: string;
  images: string[];
  niche: string;
}

export default function HomePage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [nicheCounts, setNicheCounts] = useState<Record<string, number>>({});
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: nicheData } = await supabase
        .from('niches')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (nicheData) setNiches(nicheData);
      
      // Fetch homepage branding images
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['homepage_before_image', 'homepage_after_image']);
      
      if (settingsData) {
        settingsData.forEach(item => {
          if (item.key === 'homepage_before_image') setBeforeImage(item.value);
          if (item.key === 'homepage_after_image') setAfterImage(item.value);
        });
      }

      const { data: vaultItems } = await supabase
        .from('vault_items')
        .select('id, title, images, niche, featured_on_homepage')
        .eq('is_active', true);
      
      if (vaultItems) {
        const counts: Record<string, number> = {};
        vaultItems.forEach(item => {
          counts[item.niche] = (counts[item.niche] || 0) + 1;
        });
        setNicheCounts(counts);
        
        // Get featured items first, then fill with random if needed
        const featured = vaultItems.filter(item => item.featured_on_homepage && item.images?.length > 0);
        const nonFeatured = vaultItems.filter(item => !item.featured_on_homepage && item.images?.length > 0);
        
        let previewList = [...featured];
        if (previewList.length < 8) {
          const shuffledNonFeatured = [...nonFeatured].sort(() => 0.5 - Math.random());
          previewList = [...previewList, ...shuffledNonFeatured].slice(0, 8);
        } else {
          previewList = previewList.slice(0, 8);
        }
        setPreviewItems(previewList);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const platforms = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      tagline: 'Community & Trust',
      strategy: 'Storytelling + value posts that spark conversations and build relationships',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      tagline: 'Visual Authority',
      strategy: 'Carousels + Reels that educate, inspire, and build brand recognition',
      color: 'from-pink-500 via-purple-500 to-orange-500',
      borderColor: 'border-pink-500/30',
      glowColor: 'shadow-pink-500/20',
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      tagline: 'Discovery & Attention',
      strategy: 'Short-form videos that hook in 2 seconds and deliver fast value',
      color: 'from-cyan-400 to-pink-500',
      borderColor: 'border-cyan-500/30',
      glowColor: 'shadow-cyan-500/20',
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      tagline: 'Expertise & Positioning',
      strategy: 'Insights + educational posts that position you as the authority',
      color: 'from-blue-600 to-blue-700',
      borderColor: 'border-blue-600/30',
      glowColor: 'shadow-blue-600/20',
    },
    {
      name: 'YouTube Shorts',
      icon: YouTubeIcon,
      tagline: 'Retention & Education',
      strategy: 'Quick tips and tutorials that keep viewers watching and coming back',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/20',
    },
    {
      name: 'X',
      icon: XIcon,
      tagline: 'Conversations & Fast Takes',
      strategy: 'Sharp insights, bold opinions, and threads that spark discussion',
      color: 'from-gray-700 to-gray-900',
      borderColor: 'border-gray-500/30',
      glowColor: 'shadow-gray-500/20',
    },
  ];

  const nicheIcons: Record<string, any> = {
    'roofing': Home,
    'hvac': Snowflake,
    'mortgage': DollarSign,
    'real-estate': Building2,
    'med-spa': Stethoscope,
    'dental': Stethoscope,
    'chiropractic': Stethoscope,
    'financial-planning': BarChart3,
    'auto-repair': Car,
    'pest-control': Bug,
    'plumbing': Wrench,
    'salon': Scissors,
  };

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Content Systems for Modern Businesses
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Content & Websites{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              That Grow Your Business
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/50 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered social media content and professional websites for local businesses. Everything you need to get found and win customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="#vaults"
              className="group bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              Explore Content Vaults
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/websites"
              className="group bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Building2 className="w-5 h-5" />
              Get a Website - $497
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-white/40 text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              Instant Download
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              Commercial License
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              AI-Powered Customization
            </span>
          </div>
        </div>
      </section>

      {/* Visual Proof Section */}
      <section className="py-20 bg-[#030712] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See What Modern Business Content{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Looks Like</span>
            </h2>
            <p className="text-white/50 text-lg">
              Premium graphics designed to build authority and drive engagement
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewItems.length > 0 ? (
              previewItems.map((item) => (
                <Link 
                  key={item.id}
                  href={`/industries/${item.niche}`}
                  className="aspect-square rounded-xl border border-white/10 group hover:border-blue-500/40 transition-all overflow-hidden relative"
                >
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Watermark overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 flex flex-col justify-around py-2">
                      {[0, 1, 2].map((row) => (
                        <div key={row} className="flex justify-around">
                          {[0, 1].map((col) => (
                            <div 
                              key={col} 
                              className="text-white font-black rotate-[-30deg] whitespace-nowrap text-xs md:text-sm"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  </div>
                </Link>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div 
                  key={i}
                  className="aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 flex items-center justify-center animate-pulse"
                >
                  <Sparkles className="w-8 h-8 text-white/20" />
                </div>
              ))
            )}
          </div>
          <p className="text-center text-white/30 text-sm mt-6">
            Content previews from the Pipeline AI library
          </p>
        </div>
      </section>

      {/* Platform Strategy Section */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Different Platforms. Different Strategies.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Better Results.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Content optimized for each platform&apos;s unique algorithm and audience behavior
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div 
                key={platform.name}
                className={`group relative bg-[#0d1423] rounded-2xl p-6 border ${platform.borderColor} hover:border-opacity-60 transition-all duration-300 hover:shadow-xl ${platform.glowColor}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl" />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-4 text-white`}>
                    <platform.icon />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{platform.name}</h3>
                  <p className="text-sm font-medium text-blue-400 mb-2">{platform.tagline}</p>
                  <p className="text-white/40 text-sm">{platform.strategy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niche Content Systems */}
      <section id="vaults" className="py-20 bg-[#030712] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI Content Systems{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Built For Your Industry</span>
            </h2>
            <p className="text-white/50 text-lg">
              Premium content libraries tailored to your specific niche
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {niches.map((niche) => {
                const IconComponent = nicheIcons[niche.slug] || Briefcase;
                const itemCount = nicheCounts[niche.slug] || 0;
                return (
                  <Link
                    key={niche.slug}
                    href={`/industries/${niche.slug}`}
                    className="group relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Card content */}
                    <div className="relative bg-[#0a0f1a] border border-white/10 group-hover:border-blue-500/50 rounded-xl md:rounded-2xl p-4 md:p-6 h-full transition-all">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl md:rounded-t-2xl" />
                      
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                        <IconComponent className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
                      </div>
                      
                      <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 group-hover:text-blue-400 transition-colors leading-tight">
                        {niche.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-white/40 font-medium">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Free Branding Tool Section - Hidden until perfected */}

      {/* Strategy Call CTA Section */}
      <section className="py-16 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-transparent to-emerald-950/20" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Phone className="w-4 h-4" />
                Custom Projects & Strategy
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Need a Custom Content Strategy?
              </h2>
              <p className="text-white/50 text-lg mb-6">
                Book a free 30-minute strategy call to discuss custom marketing projects, 
                ongoing content creation, or white-label solutions for your agency.
              </p>
              <ul className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Custom carousel packs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Agency partnerships
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Ongoing content support
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <a 
                href="https://calendly.com/getpipelineai-support/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25"
              >
                <Calendar className="w-5 h-5" />
                Book a Strategy Call
              </a>
              <p className="text-center text-white/40 text-sm mt-3">Free 30-minute consultation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Website Services Section */}
      <section className="py-20 bg-[#030712] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Building2 className="w-4 h-4" />
                Professional Websites
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Need a Website for Your Business?
              </h2>
              <p className="text-white/50 text-lg mb-6">
                We build stunning, mobile-friendly websites that turn visitors into customers. Launch in 7 days with zero hassle.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Custom design for your industry',
                  'Mobile-responsive on all devices',
                  'SEO optimized for local search',
                  'Contact forms & click-to-call',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/websites"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Get a Website - $497
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/websites#examples"
                  className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
                >
                  See Examples
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-[#252525] p-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                  </div>
                  <div className="flex-1 bg-[#1a1a1a] rounded px-3 py-1 text-white/30 text-xs text-center">
                    yourbusiness.com
                  </div>
                </div>
                <Image
                  src="https://sites.getpipelineai.com/images/screenshots/garcia-sons-roofing.png"
                  alt="Website Example"
                  width={600}
                  height={400}
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                + $47/mo hosting
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Growth Vaults Section */}
      <section className="py-20 bg-[#0a0f1a] relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                READY-TO-USE CONTENT
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Download Ready-To-Use Growth Vaults
              </h3>
              <p className="text-white/50 mb-8 max-w-xl mx-auto">
                Prebuilt niche content packs designed to help businesses post with more authority, consistency, and speed.
              </p>
              <Link 
                href="#vaults"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25"
              >
                Browse All Vaults
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready To Build Your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Content Advantage?
            </span>
          </h2>
          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            Start with a content vault, or use Pipeline AI to create smarter marketing assets for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#vaults"
              className="group bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              Explore Vaults
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
{/* Branding Tool - Hidden until perfected
            <Link 
              href="/brand"
              className="group bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              Try Branding Tool
            </Link>
*/}
          </div>
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
            <p className="text-xs">
              © {new Date().getFullYear()} Pipeline AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
