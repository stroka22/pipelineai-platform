import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.getpipelineai.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Known industry pages (fallback if DB unavailable)
  const knownNiches = ['pest-control', 'hvac', 'roofing'];

  // Try to fetch niches from database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: niches } = await supabase
        .from('niches')
        .select('slug, created_at')
        .eq('is_active', true);

      if (niches && niches.length > 0) {
        const industryPages: MetadataRoute.Sitemap = niches.map((niche) => ({
          url: `${baseUrl}/industries/${niche.slug}`,
          lastModified: new Date(niche.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }));

        const vaultPages: MetadataRoute.Sitemap = niches.map((niche) => ({
          url: `${baseUrl}/vault/${niche.slug}`,
          lastModified: new Date(niche.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

        return [...staticPages, ...industryPages, ...vaultPages];
      }
    } catch (error) {
      console.error('Error fetching niches for sitemap:', error);
    }
  }

  // Fallback to known niches
  const fallbackIndustryPages: MetadataRoute.Sitemap = knownNiches.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const fallbackVaultPages: MetadataRoute.Sitemap = knownNiches.map((slug) => ({
    url: `${baseUrl}/vault/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...fallbackIndustryPages, ...fallbackVaultPages];
}
