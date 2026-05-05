-- Create storage bucket for vault assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', true);

-- Allow public read access to vault bucket
CREATE POLICY "Public read access for vault"
ON storage.objects FOR SELECT
USING (bucket_id = 'vault');

-- Allow uploads to vault bucket (for admin)
CREATE POLICY "Allow uploads to vault"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vault');

-- Allow updates to vault bucket
CREATE POLICY "Allow updates to vault"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vault');

-- Allow deletes from vault bucket
CREATE POLICY "Allow deletes from vault"
ON storage.objects FOR DELETE
USING (bucket_id = 'vault');
