-- Add missing columns for unified image support
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS reference_images JSONB;
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS all_images JSONB;

-- Make niche nullable (not required for Brand Photoshoot)
ALTER TABLE carousel_queue ALTER COLUMN niche DROP NOT NULL;

-- Make category nullable too
ALTER TABLE carousel_queue ALTER COLUMN category DROP NOT NULL;
