-- Add pricing fields to vault_items table
ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS stripe_link TEXT;
