-- Add download_files field to vault_items for clean (no watermark) files
ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS download_files TEXT[];

-- Create purchases table to track completed orders
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  customer_email TEXT NOT NULL,
  vault_item_id UUID REFERENCES vault_items(id),
  amount_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'completed',
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow all operations (from server-side)
CREATE POLICY "Allow all operations on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_session ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(customer_email);
