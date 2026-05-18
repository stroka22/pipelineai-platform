-- Carousel Queue Table
CREATE TABLE IF NOT EXISTS carousel_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Carousel config
  title TEXT,
  niche TEXT NOT NULL,
  category TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'modern',
  slide_count INTEGER NOT NULL DEFAULT 8,
  topic TEXT,
  business_name TEXT,
  primary_color TEXT DEFAULT '#C96A2B',
  secondary_color TEXT DEFAULT '#081F33',
  
  -- Reference image for style matching
  reference_image_url TEXT,
  reference_analysis TEXT,
  
  -- Open prompt mode
  open_prompt TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  progress INTEGER DEFAULT 0, -- 0-100
  current_slide INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Results
  generated_image_ids UUID[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority (lower = higher priority)
  priority INTEGER DEFAULT 10
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_carousel_queue_status_priority 
ON carousel_queue (status, priority, created_at);

-- Index for user's queue items
CREATE INDEX IF NOT EXISTS idx_carousel_queue_created 
ON carousel_queue (created_at DESC);
