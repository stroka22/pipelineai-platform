-- Carousel Queue: For batch processing carousels at scale
CREATE TABLE IF NOT EXISTS carousel_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Brand info (can reference brand_profiles or store inline)
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  
  -- Or inline brand data for quick jobs
  company_name TEXT,
  person_name TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  industry TEXT,
  headshot_url TEXT, -- Optional: if provided, uses images.edit for person-in-scene
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e3a5f',
  secondary_color TEXT DEFAULT '#4a7c4e',
  accent_color TEXT DEFAULT '#c9a227',
  
  -- Carousel settings
  topic TEXT, -- What the carousel is about
  scene_prompt TEXT, -- User's custom scene instructions
  slide_count INTEGER DEFAULT 5,
  style TEXT DEFAULT 'professional', -- professional, bold, minimal, etc.
  
  -- Processing status
  status TEXT DEFAULT 'pending', -- pending, processing, generating_slides, complete, error
  current_slide INTEGER DEFAULT 0,
  
  -- Results
  slides JSONB DEFAULT '[]', -- Array of generated slide data
  error_message TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Priority (lower = higher priority)
  priority INTEGER DEFAULT 10
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_carousel_queue_status ON carousel_queue(status);
CREATE INDEX IF NOT EXISTS idx_carousel_queue_priority ON carousel_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_carousel_queue_created ON carousel_queue(created_at DESC);
