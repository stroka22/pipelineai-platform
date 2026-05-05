import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  sale_price?: number;
  product_type: 'carousel' | 'reel' | 'bundle' | 'monthly_plan' | 'addon';
  items_count: number;
  preview_image?: string;
  stripe_link?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_name: string;
  buyer_email: string;
  company_name: string;
  company_website?: string;
  phone_number: string;
  service_area?: string;
  preferred_cta?: string;
  brand_colors?: string;
  facebook_page?: string;
  instagram_page?: string;
  logo_url?: string;
  notes?: string;
  product_id: string;
  product_title: string;
  amount: number;
  status: 'new' | 'waiting_for_info' | 'in_production' | 'delivered' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  pest_topic?: string;
  source: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expires_at?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
  created_at: string;
}

export interface VaultItem {
  id: string;
  title: string;
  niche: string;
  category: string;
  content_type: 'carousel' | 'reel' | 'image' | 'video';
  slide_count: number;
  folder_path: string;
  images: string[];
  product_id?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Niche {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
