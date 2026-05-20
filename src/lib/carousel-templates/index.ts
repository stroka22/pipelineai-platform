// Carousel Template Engine - Main Entry Point

import { BrandProfile, SlideData, LayoutFamily } from './types';
import * as CorporateAuthority from './corporate-authority';

export * from './types';

// Registry of layout families and their generators
const layoutFamilies: Record<string, {
  generateSlideHTML: (slide: SlideData, brand: BrandProfile, backgroundUrl?: string) => string;
  generateBackgroundPrompt: (slideType: string, brand: BrandProfile, slideContent: string) => string;
}> = {
  'corporate-authority': CorporateAuthority,
  // Add more layout families here as we create them
  // 'modern-minimal': ModernMinimal,
  // 'bold-impact': BoldImpact,
  // 'premium-financial': PremiumFinancial,
  // 'dynamic-growth': DynamicGrowth,
};

/**
 * Generate HTML for a single slide
 */
export function generateSlideHTML(
  layoutFamily: string,
  slide: SlideData,
  brand: BrandProfile,
  backgroundUrl?: string
): string {
  const family = layoutFamilies[layoutFamily] || layoutFamilies['corporate-authority'];
  return family.generateSlideHTML(slide, brand, backgroundUrl);
}

/**
 * Generate a background prompt for AI image generation
 */
export function generateBackgroundPrompt(
  layoutFamily: string,
  slideType: string,
  brand: BrandProfile,
  slideContent: string
): string {
  const family = layoutFamilies[layoutFamily] || layoutFamilies['corporate-authority'];
  return family.generateBackgroundPrompt(slideType, brand, slideContent);
}

/**
 * Get available layout families
 */
export function getAvailableLayoutFamilies(): string[] {
  return Object.keys(layoutFamilies);
}

/**
 * Calculate quality score for a carousel
 * Checks for common issues and returns 0-100
 */
export function calculateQualityScore(
  slides: SlideData[],
  brand: BrandProfile
): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Check brand completeness
  if (!brand.logo_url) {
    issues.push('Missing logo');
    score -= 10;
  }
  if (!brand.headshot_url) {
    issues.push('Missing headshot');
    score -= 10;
  }
  if (!brand.phone && !brand.email && !brand.website) {
    issues.push('No contact information');
    score -= 15;
  }

  // Check slides
  slides.forEach((slide, i) => {
    if (!slide.headline || slide.headline.length < 5) {
      issues.push(`Slide ${i + 1}: Missing or short headline`);
      score -= 5;
    }
    if (slide.headline && slide.headline.length > 60) {
      issues.push(`Slide ${i + 1}: Headline too long`);
      score -= 3;
    }
    if (!slide.backgroundUrl) {
      issues.push(`Slide ${i + 1}: Missing background`);
      score -= 5;
    }
  });

  // Check first slide (hook)
  const firstSlide = slides[0];
  if (firstSlide && !firstSlide.includeLogo) {
    issues.push('First slide should include logo');
    score -= 5;
  }

  // Check last slide (CTA)
  const lastSlide = slides[slides.length - 1];
  if (lastSlide && !lastSlide.includeContactBar) {
    issues.push('Last slide should include contact bar');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
  };
}

/**
 * Default slide structure for different slide types
 */
export const slideTypeDefaults: Record<string, Partial<SlideData>> = {
  hook: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: false,
  },
  benefits: {
    includeHeadshot: false,
    includeLogo: true,
    includeContactBar: false,
  },
  stats: {
    includeHeadshot: false,
    includeLogo: true,
    includeContactBar: false,
  },
  services: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: false,
  },
  experience: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: false,
  },
  trust: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: false,
  },
  cta: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: true,
  },
  contact: {
    includeHeadshot: true,
    includeLogo: true,
    includeContactBar: true,
  },
};
