import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import IndustryPage from '@/components/IndustryPage';
import { Metadata } from 'next';

let supabaseInstance: SupabaseClient | null = null;

// Lazy singleton: instantiate only when a request needs it, so the build's
// config-collection step never evaluates the client at module-import time.
function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: niche } = await getSupabase()
    .from('niches')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!niche) {
    return {
      title: 'Not Found | Pipeline AI',
    };
  }

  return {
    title: `${niche.name} Social Media Content | Pipeline AI`,
    description: niche.description || `Ready-to-post carousels and growth content designed to help ${niche.name.toLowerCase()} companies dominate social media. Buy 2 get 1 free on 10-slide carousels.`,
    openGraph: {
      title: `${niche.name} Social Media Content | Pipeline AI`,
      description: `Ready-to-post carousels and growth content for ${niche.name.toLowerCase()} companies.`,
    },
  };
}

export default async function DynamicIndustryPage({ params }: Props) {
  const { slug } = await params;

  const { data: niche } = await getSupabase()
    .from('niches')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!niche) {
    notFound();
  }

  // Generate tagline based on niche or use a default
  const taglines: Record<string, string> = {
    'pest-control': 'Builds Authority',
    'hvac': 'Builds Trust',
    'roofing': 'Builds Credibility',
    'plumbing': 'Builds Trust',
    'chiropractor': 'Builds Authority',
  };

  const tagline = taglines[slug] || 'Drives Growth';
  const description = niche.description || `Ready-to-post carousels and growth content designed to help ${niche.name.toLowerCase()} companies dominate social media.`;

  return (
    <IndustryPage
      niche={niche.name}
      nicheSlug={niche.slug}
      tagline={tagline}
      description={description}
    />
  );
}
