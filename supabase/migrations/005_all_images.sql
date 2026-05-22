-- Add missing columns for unified image support
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS reference_images JSONB;
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS all_images JSONB;
