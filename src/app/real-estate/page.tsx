import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import RealEstatePageClient from './RealEstatePageClient';

export const metadata: Metadata = {
  title: 'Real Estate Branding & Content | Pipeline AI',
  description: 'Premium branded content for real estate professionals. Carousels, posts, and full branding packages designed to make you the authority in your market.',
  keywords: 'real estate branding, real estate social media, real estate content, real estate carousels, real estate marketing',
};

async function getGalleryData() {
  const [singlesRes, carouselsRes] = await Promise.all([
    supabase
      .from('gallery_items')
      .select('*')
      .eq('niche', 'real-estate')
      .eq('type', 'single')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('gallery_items')
      .select('*')
      .eq('niche', 'real-estate')
      .eq('type', 'carousel')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ]);

  return {
    singles: singlesRes.data || [],
    carousels: carouselsRes.data || [],
  };
}

export default async function RealEstatePage() {
  const { singles, carousels } = await getGalleryData();
  return <RealEstatePageClient singles={singles} carousels={carousels} />;
}
