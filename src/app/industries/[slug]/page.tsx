import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import IndustryPage from '@/components/IndustryPage';
import { Metadata } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: niche } = await supabase
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

  const { data: niche } = await supabase
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
