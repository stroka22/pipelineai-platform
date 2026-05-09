-- Add download_files column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS download_files JSONB DEFAULT '[]';

-- Create a storage bucket for product downloads (run this via Supabase Dashboard > Storage)
-- Bucket name: downloads
-- Public: false (we'll generate signed URLs for access)

-- Update RLS for products to allow updates
CREATE POLICY "Enable update for products" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for products" ON products
  FOR DELETE USING (true);
