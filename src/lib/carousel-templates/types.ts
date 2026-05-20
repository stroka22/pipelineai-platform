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

// Adaptive layout types
export type HeadshotPosition = 
  | 'left-center' | 'right-center' | 'center'
  | 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom'
  | 'floating-right' | 'floating-left'
  | 'hero-large' | 'contact-bar';

export type HeadshotSize = 'small' | 'medium' | 'large' | 'hero' | 'thumbnail';

export type HeadshotShape = 'circle' | 'rounded-rect' | 'square' | 'hexagon' | 'arch' | 'blob';

export type HeadshotStyle = 
  | 'clean' | 'soft-shadow' | 'dramatic-shadow' 
  | 'glow' | 'gradient-border' | 'double-border'
  | 'cutout' | 'floating' | 'framed';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'contact-bar';

export type TextAlignment = 'left' | 'center' | 'right';

export type ContentPosition = 'left' | 'right' | 'center' | 'bottom' | 'top';

export interface HeadshotLayout {
  position: HeadshotPosition;
  size: HeadshotSize;
  shape: HeadshotShape;
  style: HeadshotStyle;
  borderColor?: string;
  glowColor?: string;
  shadowDirection?: 'left' | 'right' | 'bottom' | 'center';
  overlayOnBackground?: boolean;
}

export interface LogoLayout {
  position: LogoPosition;
  size: 'small' | 'medium' | 'large';
  style: 'clean' | 'white-bg' | 'shadow';
}

export interface ContentLayout {
  position: ContentPosition;
  alignment: TextAlignment;
  width: 'narrow' | 'medium' | 'wide' | 'full';
  verticalAlign: 'top' | 'center' | 'bottom';
}

export interface SlideLayout {
  headshot?: HeadshotLayout;
  logo?: LogoLayout;
  content: ContentLayout;
  backgroundStyle: 'full-bleed' | 'gradient-overlay' | 'split' | 'vignette';
  colorOverlay?: string;
  overlayOpacity?: number;
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
  layout: SlideLayout;
  // Legacy fields for compatibility
  includeHeadshot?: boolean;
  includeLogo?: boolean;
  includeContactBar?: boolean;
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
