-- Add missing columns for unified image support
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS reference_images JSONB;
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS all_images JSONB;

-- Make legacy NOT NULL columns nullable for Brand Photoshoot compatibility
ALTER TABLE carousel_queue ALTER COLUMN niche DROP NOT NULL;
ALTER TABLE carousel_queue ALTER COLUMN category DROP NOT NULL;
