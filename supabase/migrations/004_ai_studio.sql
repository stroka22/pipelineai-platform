-- AI Studio Tables for Pipeline AI
-- Phase 1 MVP: Image Factory + Content Operating System

-- Brand Profiles: Store client/business brand kits
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  niche TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  
  -- Visual Identity
  logo_url TEXT,
  primary_color TEXT DEFAULT '#C96A2B',
  secondary_color TEXT DEFAULT '#081F33',
  accent_color TEXT,
  font_style TEXT DEFAULT 'modern',
  
  -- Brand Voice
  tone TEXT DEFAULT 'professional',
  tagline TEXT,
  cta_style TEXT DEFAULT 'direct',
  
  -- Social
  instagram_handle TEXT,
  facebook_handle TEXT,
  linkedin_handle TEXT,
  
  -- Meta
  is_default BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Prompt Templates: Reusable prompt configurations
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'image', 'carousel', 'copy'
  niche TEXT, -- optional niche-specific
  
  -- Prompt content
  prompt_text TEXT NOT NULL,
  system_instructions TEXT,
  
  -- Style settings
  style_preset TEXT,
  aspect_ratio TEXT DEFAULT '1:1',
  
  -- Meta
  is_featured BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0
);

-- Generated Images: All AI-generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  carousel_slide_id UUID, -- Set after carousel_slides table exists
  prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  
  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Generation details
  prompt_used TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-image-2',
  aspect_ratio TEXT DEFAULT '1:1',
  size TEXT DEFAULT '1024x1024',
  
  -- Metadata
  title TEXT,
  content_type TEXT, -- 'social', 'ad', 'carousel_slide', 'thumbnail', etc.
  niche TEXT,
  style TEXT,
  platform TEXT, -- 'instagram', 'facebook', 'linkedin', etc.
  
  -- Organization
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Stats
  download_count INTEGER DEFAULT 0
);

-- Carousel Projects: Container for carousel slides
CREATE TABLE IF NOT EXISTS carousel_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  
  -- Project info
  title TEXT NOT NULL,
  description TEXT,
  slide_count INTEGER DEFAULT 5,
  
  -- Category/Type
  category TEXT, -- 'myths_vs_reality', 'mistakes', 'educational', etc.
  niche TEXT,
  
  -- Style
  style_preset TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'complete', 'archived'
  
  -- Meta
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Carousel Slides: Individual slides within a carousel
CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  carousel_project_id UUID NOT NULL REFERENCES carousel_projects(id) ON DELETE CASCADE,
  generated_image_id UUID REFERENCES generated_images(id) ON DELETE SET NULL,
  
  -- Slide content
  slide_number INTEGER NOT NULL,
  headline TEXT,
  body_text TEXT,
  cta_text TEXT,
  
  -- Generation
  prompt_used TEXT,
  image_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' -- 'pending', 'generating', 'complete', 'error'
);

-- Add foreign key to generated_images after carousel_slides exists
ALTER TABLE generated_images 
ADD CONSTRAINT fk_carousel_slide 
FOREIGN KEY (carousel_slide_id) 
REFERENCES carousel_slides(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_images_brand ON generated_images(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_type ON generated_images(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_images_niche ON generated_images(niche);
CREATE INDEX IF NOT EXISTS idx_generated_images_created ON generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carousel_projects_brand ON carousel_projects(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_project ON carousel_slides(carousel_project_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_niche ON prompt_templates(niche);

-- Enable RLS
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - admin only access)
CREATE POLICY "Allow all for brand_profiles" ON brand_profiles FOR ALL USING (true);
CREATE POLICY "Allow all for prompt_templates" ON prompt_templates FOR ALL USING (true);
CREATE POLICY "Allow all for generated_images" ON generated_images FOR ALL USING (true);
CREATE POLICY "Allow all for carousel_projects" ON carousel_projects FOR ALL USING (true);
CREATE POLICY "Allow all for carousel_slides" ON carousel_slides FOR ALL USING (true);

-- Insert default prompt templates
INSERT INTO prompt_templates (name, description, category, prompt_text, style_preset, is_featured) VALUES
('Cinematic Social Post', 'High-end cinematic social media graphic', 'image', 'Create a cinematic, premium social media graphic with dramatic lighting, luxury aesthetic, and professional composition. The image should feel high-end and editorial.', 'cinematic', true),
('Educational Carousel', 'Clean educational content slide', 'carousel', 'Create a clean, modern educational graphic with clear typography, professional layout, and easy-to-read information hierarchy. Minimal but impactful.', 'modern', true),
('Lead Generation Ad', 'Direct response style ad graphic', 'image', 'Create a compelling lead generation graphic with strong visual hook, clear value proposition, and prominent call-to-action area. Professional but attention-grabbing.', 'direct', true),
('Quote Graphic', 'Inspirational quote visual', 'image', 'Create an elegant quote graphic with beautiful typography, subtle background texture, and sophisticated composition. The text should be the hero.', 'minimal', true),
('Before/After', 'Transformation comparison visual', 'carousel', 'Create a professional before/after comparison graphic with clear visual separation, compelling transformation story, and premium aesthetic.', 'modern', true);

-- Insert niche-specific templates
INSERT INTO prompt_templates (name, description, category, niche, prompt_text, style_preset) VALUES
('Roofing - Trust Builder', 'Authority-building roofing content', 'image', 'roofing', 'Create a professional roofing company social media graphic showcasing expertise, trust, and quality craftsmanship. Include imagery of premium roofing work, dramatic sky, and professional aesthetic.', 'cinematic'),
('HVAC - Comfort Focus', 'Comfort and reliability HVAC content', 'image', 'hvac', 'Create a premium HVAC company graphic emphasizing home comfort, reliability, and professional service. Clean, modern aesthetic with warm, inviting feeling.', 'modern'),
('Med Spa - Luxury', 'High-end med spa aesthetic', 'image', 'med-spa', 'Create a luxury med spa social media graphic with elegant, sophisticated aesthetic. Soft lighting, premium feel, wellness-focused imagery. High-end editorial style.', 'luxury'),
('Dental - Confidence', 'Bright, confident dental content', 'image', 'dental', 'Create a professional dental practice graphic emphasizing confidence, bright smiles, and modern care. Clean, trustworthy, and welcoming aesthetic.', 'modern'),
('Real Estate - Premium', 'Luxury real estate visual', 'image', 'real-estate', 'Create a premium real estate marketing graphic with cinematic property photography style, luxury aesthetic, and professional composition. High-end editorial feel.', 'cinematic');
