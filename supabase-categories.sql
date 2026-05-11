-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  niche_slug VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, niche_slug)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Insert default categories for pest-control
INSERT INTO categories (name, niche_slug, icon, display_order) VALUES
  ('Termites', 'pest-control', '🪵', 1),
  ('Roaches', 'pest-control', '🪳', 2),
  ('Rodents', 'pest-control', '🐀', 3),
  ('Mosquitoes', 'pest-control', '🦟', 4),
  ('Ants', 'pest-control', '🐜', 5),
  ('Bed Bugs', 'pest-control', '🛏️', 6),
  ('General', 'pest-control', '🏠', 7)
ON CONFLICT (name, niche_slug) DO NOTHING;

-- Insert default categories for hvac
INSERT INTO categories (name, niche_slug, icon, display_order) VALUES
  ('AC Repair', 'hvac', '❄️', 1),
  ('Heating', 'hvac', '🔥', 2),
  ('Maintenance', 'hvac', '🔧', 3),
  ('Installation', 'hvac', '🏗️', 4),
  ('Energy Efficiency', 'hvac', '⚡', 5),
  ('General', 'hvac', '🏠', 6)
ON CONFLICT (name, niche_slug) DO NOTHING;

-- Insert default categories for roofing
INSERT INTO categories (name, niche_slug, icon, display_order) VALUES
  ('Storm Damage', 'roofing', '⛈️', 1),
  ('Repairs', 'roofing', '🔨', 2),
  ('Replacement', 'roofing', '🏠', 3),
  ('Inspection', 'roofing', '🔍', 4),
  ('Materials', 'roofing', '🧱', 5),
  ('General', 'roofing', '📋', 6)
ON CONFLICT (name, niche_slug) DO NOTHING;
