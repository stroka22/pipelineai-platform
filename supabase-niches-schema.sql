-- Create niches table
CREATE TABLE niches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Niches are viewable by everyone" ON niches
  FOR SELECT USING (is_active = true);

-- Allow all operations for admin
CREATE POLICY "Enable all for niches" ON niches
  FOR ALL USING (true) WITH CHECK (true);

-- Remove the CHECK constraint from vault_items
ALTER TABLE vault_items DROP CONSTRAINT IF EXISTS vault_items_niche_check;

-- Insert initial niches
INSERT INTO niches (slug, name, description, display_order) VALUES
  ('pest-control', 'Pest Control', 'Content for pest control companies', 1),
  ('hvac', 'HVAC', 'Content for heating and cooling companies', 2),
  ('roofing', 'Roofing', 'Content for roofing contractors', 3);
