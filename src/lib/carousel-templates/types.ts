// Core types for the carousel rendering engine

export interface BrandProfile {
  id: string;
  name: string;
  company_name: string;
  person_name?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  headshot_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  industry?: string;
  tagline?: string;
}

export interface SlideData {
  id: string;
  slideNumber: number;
  slideType: SlideType;
  headline: string;
  subheadline?: string;
  bodyText?: string;
  bulletPoints?: string[];
  cta?: string;
  stats?: { value: string; label: string }[];
  backgroundUrl?: string;
  backgroundPrompt?: string;
  includeHeadshot: boolean;
  includeLogo: boolean;
  includeContactBar: boolean;
  customOverrides?: Record<string, any>;
}

export type SlideType = 
  | 'hook'
  | 'benefits'
  | 'features'
  | 'stats'
  | 'process'
  | 'services'
  | 'experience'
  | 'trust'
  | 'testimonial'
  | 'about'
  | 'problem'
  | 'solution'
  | 'proof'
  | 'results'
  | 'challenges'
  | 'solutions'
  | 'contact'
  | 'cta';

export interface CarouselProject {
  id: string;
  brand_profile_id?: string;
  layout_family_id?: string;
  title: string;
  niche?: string;
  topic?: string;
  status: 'draft' | 'generating' | 'ready' | 'exported';
  slide_count: number;
  slides: SlideData[];
  quality_score?: number;
}

export interface LayoutFamily {
  id: string;
  slug: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  style_config: {
    fontHeadline?: string;
    fontBody?: string;
    cornerRadius?: number;
  };
  slide_types: SlideType[];
  is_active: boolean;
}

export interface RenderOptions {
  width: number;
  height: number;
  format: 'png' | 'jpeg';
  quality?: number;
}

export interface CarouselStrategy {
  overview: string;
  targetAudience: string;
  keyMessage: string;
  slides: SlideData[];
}

export interface BackgroundGeneration {
  prompt: string;
  style: string;
  colors: string[];
  niche?: string;
}
