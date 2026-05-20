-- Brand Profiles: Store client branding assets and info
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Profile name for easy reference
  company_name TEXT NOT NULL,
  person_name TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  headshot_url TEXT,
  primary_color TEXT DEFAULT '#1e3a5f',
  secondary_color TEXT DEFAULT '#4a7c4e',
  accent_color TEXT DEFAULT '#c9a227',
  industry TEXT,
  tagline TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Layout Families: Coded template families
CREATE TABLE IF NOT EXISTS layout_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  style_config JSONB DEFAULT '{}', -- colors, fonts, spacing defaults
  slide_types JSONB DEFAULT '[]', -- available slide types in this family
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default layout families
INSERT INTO layout_families (slug, name, description, style_config, slide_types) VALUES
('corporate-authority', 'Corporate Authority', 'Premium corporate design with strong visual hierarchy', 
 '{"fontHeadline": "Arial Black", "fontBody": "Arial", "cornerRadius": 16}',
 '["hook", "benefits", "stats", "process", "testimonial", "cta"]'),
('modern-minimal', 'Modern Minimal', 'Clean, minimalist design with plenty of whitespace',
 '{"fontHeadline": "Helvetica Neue", "fontBody": "Helvetica", "cornerRadius": 8}',
 '["hook", "benefits", "features", "about", "cta"]'),
('bold-impact', 'Bold Impact', 'High-contrast, attention-grabbing design',
 '{"fontHeadline": "Impact", "fontBody": "Arial", "cornerRadius": 0}',
 '["hook", "problem", "solution", "proof", "cta"]'),
('premium-financial', 'Premium Financial', 'Sophisticated design for financial services',
 '{"fontHeadline": "Georgia", "fontBody": "Arial", "cornerRadius": 12}',
 '["hook", "services", "experience", "trust", "contact"]'),
('dynamic-growth', 'Dynamic Growth', 'Energetic design with growth-focused visuals',
 '{"fontHeadline": "Montserrat", "fontBody": "Open Sans", "cornerRadius": 20}',
 '["hook", "challenges", "solutions", "results", "cta"]')
ON CONFLICT (slug) DO NOTHING;

-- Carousel Projects: Main carousel data
CREATE TABLE IF NOT EXISTS carousel_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  layout_family_id UUID REFERENCES layout_families(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  niche TEXT,
  topic TEXT,
  status TEXT DEFAULT 'draft', -- draft, generating, ready, exported
  slide_count INTEGER DEFAULT 5,
  slides JSONB DEFAULT '[]', -- Array of slide objects
  quality_score INTEGER, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Backgrounds: Reusable AI-generated backgrounds
CREATE TABLE IF NOT EXISTS generated_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT, -- corporate, minimal, bold, etc.
  niche TEXT,
  colors JSONB, -- dominant colors detected
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_name ON brand_profiles(name);
CREATE INDEX IF NOT EXISTS idx_carousel_projects_status ON carousel_projects(status);
CREATE INDEX IF NOT EXISTS idx_carousel_projects_brand ON carousel_projects(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_generated_backgrounds_style ON generated_backgrounds(style);
CREATE INDEX IF NOT EXISTS idx_generated_backgrounds_niche ON generated_backgrounds(niche);
