-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  product_type TEXT NOT NULL CHECK (product_type IN ('carousel', 'reel', 'bundle', 'monthly_plan', 'addon')),
  items_count INTEGER DEFAULT 1,
  preview_image TEXT,
  stripe_link TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_website TEXT,
  phone_number TEXT NOT NULL,
  service_area TEXT,
  preferred_cta TEXT,
  brand_colors TEXT,
  facebook_page TEXT,
  instagram_page TEXT,
  logo_url TEXT,
  notes TEXT,
  product_id UUID REFERENCES products(id),
  product_title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'waiting_for_info', 'in_production', 'delivered', 'completed')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  website TEXT,
  pest_topic TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_active = true);

-- Create policies for inserting leads (anyone can submit)
CREATE POLICY "Anyone can submit leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Create policies for inserting orders (anyone can submit)
CREATE POLICY "Anyone can submit orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (title, description, category, price, product_type, items_count, is_active, is_featured) VALUES
  ('Termite Carousel Pack', 'Professional termite awareness carousel campaign with 3 multi-slide posts', 'Termites', 97.00, 'carousel', 3, true, false),
  ('Roach Carousel Pack', 'Roach infestation education campaign with 3 multi-slide posts', 'Roaches', 97.00, 'carousel', 3, true, false),
  ('Rodent Carousel Pack', 'Rodent warning campaign with 3 multi-slide posts', 'Rodents', 97.00, 'carousel', 3, true, false),
  ('Mosquito Carousel Pack', 'Mosquito season awareness campaign with 3 multi-slide posts', 'Mosquitoes', 97.00, 'carousel', 3, true, false),
  ('Ant Carousel Pack', 'Ant invasion education campaign with 3 multi-slide posts', 'Ants', 97.00, 'carousel', 3, true, false),
  ('General Pest Image Pack', 'Mixed pest awareness graphics pack with 5 images', 'General', 97.00, 'carousel', 5, true, false),
  ('Single Branded Reel', 'One custom 15-30 second vertical video', 'Reels', 147.00, 'reel', 1, true, false),
  ('3-Reel Pack', 'Three custom short-form vertical videos', 'Reels', 347.00, 'reel', 3, true, true),
  ('3-Pack Carousel Bundle', 'Choose any 3 carousel packs', 'Bundle', 247.00, 'bundle', 9, true, false),
  ('Founder Starter Bundle', 'Complete starter package with 5 carousels + 2 reels', 'Bundle', 497.00, 'bundle', 15, true, true),
  ('Starter Growth Monthly', '3 branded carousel campaigns + 1 reel per month', 'Monthly', 297.00, 'monthly_plan', 4, true, false),
  ('Authority Growth Monthly', '4 premium campaigns + 2 reels + monthly theme', 'Monthly', 497.00, 'monthly_plan', 6, true, true),
  ('Market Leader Monthly', '8+ monthly assets, reels, carousels, seasonal campaigns', 'Monthly', 697.00, 'monthly_plan', 8, true, false),
  ('Rush Delivery', '24-hour delivery upgrade', 'Add-on', 49.00, 'addon', 1, true, false),
  ('Additional City Version', 'Extra city-specific version of assets', 'Add-on', 29.00, 'addon', 1, true, false),
  ('Extra Revision', 'One additional revision round', 'Add-on', 25.00, 'addon', 1, true, false);
