-- Gallery items for niche-specific gallery pages
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single', -- 'single', 'carousel', 'video'
  title TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  caption TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for admin access
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON gallery_items FOR ALL USING (true) WITH CHECK (true);
