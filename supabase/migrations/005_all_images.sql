-- Add all_images column for unified image uploads
ALTER TABLE carousel_queue ADD COLUMN IF NOT EXISTS all_images JSONB;
