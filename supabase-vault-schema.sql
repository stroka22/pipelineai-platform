-- Vault Items table
CREATE TABLE vault_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  niche TEXT NOT NULL CHECK (niche IN ('pest-control', 'hvac', 'roofing')),
  category TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('carousel', 'reel', 'image')),
  slide_count INTEGER DEFAULT 1,
  folder_path TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  product_id UUID REFERENCES products(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Vault items are viewable by everyone" ON vault_items
  FOR SELECT USING (is_active = true);

-- Create policy for all operations (for admin via anon key - in production use service key)
CREATE POLICY "Enable all for authenticated" ON vault_items
  FOR ALL USING (true) WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON vault_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the existing roach carousel
INSERT INTO vault_items (title, niche, category, content_type, slide_count, folder_path, images) VALUES
  ('One Roach Is A Warning Sign', 'pest-control', 'Roaches', 'carousel', 10, 
   '/vault/pest-control/carousels/roach-warning-sign',
   '["/vault/pest-control/carousels/roach-warning-sign/Roaches-1.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-2.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-3.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-4.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-5.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-6.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-7.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-8.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-9.PNG","/vault/pest-control/carousels/roach-warning-sign/Roaches-10.PNG"]'
  );
