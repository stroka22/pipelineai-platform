import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import NicheGalleryClient from './NicheGalleryClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ niche: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche } = await params;
  const { data: nicheData } = await supabase
    .from('niches')
    .select('name, hero_headline')
    .or(`slug.eq.${niche},gallery_slug.eq.${niche}`)
    .single();

  const name = nicheData?.name || niche;
  return {
    title: `${name} Branding & Content | Pipeline AI`,
    description: `Premium branded content for ${name.toLowerCase()} professionals. Carousels, posts, and full branding packages designed to make you the authority.`,
  };
}

// Dynamic - always fetches fresh data from Supabase

async function getNicheData(niche: string) {
  const [nicheRes, singlesRes, carouselsRes, packagesRes] = await Promise.all([
    supabase
      .from('niches')
      .select('*')
      .or(`slug.eq.${niche},gallery_slug.eq.${niche}`)
      .eq('has_gallery_page', true)
      .single(),
    supabase
      .from('gallery_items')
      .select('*')
      .eq('niche', niche)
      .eq('type', 'single')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('gallery_items')
      .select('*')
      .eq('niche', niche)
      .eq('type', 'carousel')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('gallery_packages')
      .select('*')
      .eq('niche_slug', niche)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ]);

  return {
    niche: nicheRes.data,
    singles: singlesRes.data || [],
    carousels: carouselsRes.data || [],
    packages: packagesRes.data || [],
  };
}

export default async function NicheGalleryPage({ params }: Props) {
  const { niche } = await params;
  const data = await getNicheData(niche);

  if (!data.niche) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Gallery Not Found</h1>
          <a href="/" className="text-blue-400 hover:underline">← Back to home</a>
        </div>
      </div>
    );
  }

  return <NicheGalleryClient niche={data.niche} singles={data.singles} carousels={data.carousels} packages={data.packages} />;
}
