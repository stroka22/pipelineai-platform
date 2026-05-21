'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Camera,
  Building2, 
  FileText, 
  FolderOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Layers,
  Wand2
} from 'lucide-react';


export default function StudioDashboard() {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalBrands: 0,
    totalTemplates: 0,
    queueItems: 0,
  });
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [imagesRes, brandsRes, templatesRes, queueRes] = await Promise.all([
        supabase.from('generated_images').select('*', { count: 'exact', head: true }),
        supabase.from('brand_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('prompt_templates').select('*', { count: 'exact', head: true }),
        supabase.from('carousel_queue').select('*', { count: 'exact', head: true }).neq('status', 'complete'),
      ]);

      setStats({
        totalImages: imagesRes.count || 0,
        totalBrands: brandsRes.count || 0,
        totalTemplates: templatesRes.count || 0,
        queueItems: queueRes.count || 0,
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

  const createTools = [
    {
      title: 'Brand Photoshoot',
      description: 'Put clients in professional scenes with AI',
      icon: Camera,
      href: '/admin/brand-photoshoot',
      color: 'from-purple-500 to-pink-600',
      badge: stats.queueItems > 0 ? `${stats.queueItems} in queue` : null,
    },
    {
      title: 'Generate Image',
      description: 'Create a single AI image from prompt',
      icon: Wand2,
      href: '/admin/studio/generate',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Pro Create',
      description: 'Composite headshots & logos on templates',
      icon: Layers,
      href: '/admin/studio/pro-create',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const manageTools = [
    {
      title: 'Content Library',
      description: 'Browse all generated images',
      icon: FolderOpen,
      href: '/admin/studio/library',
      color: 'from-emerald-500 to-green-600',
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
      color: 'from-slate-500 to-gray-600',
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
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Studio
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalImages}</p>
                <p className="text-white/50 text-sm">Images</p>
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

        {/* Create Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Create
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {createTools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all relative"
              >
                {tool.badge && (
                  <span className="absolute top-3 right-3 bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-white/50 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Manage Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            Manage
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {manageTools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-white/50 text-sm">{tool.description}</p>
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
              className="text-purple-400 text-sm hover:underline"
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
                <ImageIcon className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-white font-semibold mb-2">No images yet</h3>
              <p className="text-white/50 text-sm mb-4">Start generating AI images to build your content library</p>
              <Link
                href="/admin/brand-photoshoot"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-500 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Start Brand Photoshoot
              </Link>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Pro Tip</h3>
              <p className="text-white/60 text-sm">
                <strong>Brand Photoshoot</strong> is your main tool - upload a headshot, describe the scene, and AI places 
                your client in professional settings while preserving their exact likeness. Queue multiple clients to produce at scale.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
