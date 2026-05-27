-- Add gallery page configuration to niches table
ALTER TABLE niches ADD COLUMN IF NOT EXISTS hero_headline TEXT;
ALTER TABLE niches ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE niches ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3b82f6';
ALTER TABLE niches ADD COLUMN IF NOT EXISTS has_gallery_page BOOLEAN DEFAULT false;
ALTER TABLE ADD COLUMN IF NOT EXISTS gallery_slug TEXT;

-- Set real-estate as having a gallery page
UPDATE niches SET 
  has_gallery_page = true, 
  gallery_slug = 'real-estate',
  hero_headline = 'Dominate Your Local Market',
  hero_subtitle = 'Premium branded content that positions you as the go-to real estate authority in your area. Professional carousels, posts, and campaigns — designed to make you impossible to ignore.',
  accent_color = '#3b82f6'
WHERE slug = 'real-estate' OR name ILIKE '%real estate%';

-- Packages table (per-niche customizable)
CREATE TABLE IF NOT EXISTS gallery_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT DEFAULT '/month',
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  cta_text TEXT DEFAULT 'Get Started',
  is_popular BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default packages for real estate
INSERT INTO gallery_packages (niche_slug, name, price, description, features, cta_text, is_popular, display_order) VALUES
('real-estate', 'Branding Essentials', '$497', 'Consistent branded presence that builds recognition', 
  ARRAY['8 branded posts/month', '2 carousels/month', 'Captions included', 'Consistent branding', 'Basic strategy support'],
  'Start Branding', false, 1),
('real-estate', 'Growth Branding', '$997', 'Full content engine that drives engagement and leads',
  ARRAY['16–20 posts/month', '4 carousels/month', 'Reels & motion content', 'Educational content', 'Seasonal campaigns', 'Captions included', 'Monthly planning', 'Profile optimization'],
  'Accelerate Growth', true, 2),
('real-estate', 'Authority Branding', '$1,997–2,500+', 'Dominant market presence that positions you as THE authority',
  ARRAY['Daily content', 'Advanced reels & carousels', 'Listing promotions', 'Luxury branding campaigns', 'Story content', 'Priority turnaround', 'Growth strategy support'],
  'Claim Authority', false, 3);

-- Disable RLS
ALTER TABLE gallery_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON gallery_packages FOR ALL USING (true) WITH CHECK (true);

-- Add gallery_slug to niches
ALTER TABLE niches ADD COLUMN IF NOT EXISTS gallery_slug TEXT;

-- Update again with gallery_slug
UPDATE niches SET gallery_slug = 'real-estate' WHERE slug = 'real-estate' OR name ILIKE '%real estate%';
