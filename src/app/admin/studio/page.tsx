'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Building2, 
  FileText, 
  FolderOpen,
  Plus,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';


export default function StudioDashboard() {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalCarousels: 0,
    totalBrands: 0,
    totalTemplates: 0,
  });
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [imagesRes, carouselsRes, brandsRes, templatesRes] = await Promise.all([
        supabase.from('generated_images').select('*', { count: 'exact', head: true }),
        supabase.from('carousel_projects').select('*', { count: 'exact', head: true }),
        supabase.from('brand_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('prompt_templates').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalImages: imagesRes.count || 0,
        totalCarousels: carouselsRes.count || 0,
        totalBrands: brandsRes.count || 0,
        totalTemplates: templatesRes.count || 0,
      });

      // Load recent images
      const { data: images } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      setRecentImages(images || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    {
      title: 'AI Create',
      description: 'Prompt + images = magic',
      icon: Sparkles,
      href: '/admin/studio/create',
      color: 'from-fuchsia-500 to-purple-600',
    },
    {
      title: 'Generate Image',
      description: 'Create a single AI image',
      icon: ImageIcon,
      href: '/admin/studio/generate',
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Create Carousel',
      description: 'Build a 5 or 10 slide carousel',
      icon: Layers,
      href: '/admin/studio/carousel',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Brand Profiles',
      description: 'Manage client brands',
      icon: Building2,
      href: '/admin/studio/brands',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Prompt Templates',
      description: 'Saved prompt configurations',
      icon: FileText,
      href: '/admin/studio/templates',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Queue',
      description: 'Background carousel generation',
      icon: Clock,
      href: '/admin/studio/queue',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-white/60 hover:text-white text-sm">
                ← Admin
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C96A2B]" />
                AI Studio
              </h1>
            </div>
            <Link
              href="/admin/studio/library"
              className="text-white/60 hover:text-white text-sm flex items-center gap-1"
            >
              <FolderOpen className="w-4 h-4" />
              Content Library
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalImages}</p>
                <p className="text-white/50 text-sm">Images</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalCarousels}</p>
                <p className="text-white/50 text-sm">Carousels</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalBrands}</p>
                <p className="text-white/50 text-sm">Brands</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalTemplates}</p>
                <p className="text-white/50 text-sm">Templates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  {action.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-white/50 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Generations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Generations</h2>
            <Link
              href="/admin/studio/library"
              className="text-[#C96A2B] text-sm hover:underline"
            >
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square bg-white/5 rounded-xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image.image_url}
                    alt={image.title || 'Generated image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-white font-semibold mb-2">No images yet</h3>
              <p className="text-white/50 text-sm mb-4">Start generating AI images to build your content library</p>
              <Link
                href="/admin/studio/generate"
                className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#B55D24] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate First Image
              </Link>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-[#C96A2B]/20 to-transparent border border-[#C96A2B]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#C96A2B] rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Pro Tip</h3>
              <p className="text-white/60 text-sm">
                Create Brand Profiles first to save time. When you generate content, you can select a brand 
                and all the business details, colors, and style preferences will be auto-applied.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
