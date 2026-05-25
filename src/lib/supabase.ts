import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Lazy singleton - only creates client when actually accessed
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// Export a getter instead of an eager instance
// This prevents build-time errors when env vars aren't available
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

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
  download_files?: string[];
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

export interface Category {
  id: string;
  name: string;
  niche_slug: string;
  icon?: string;
  display_order: number;
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
  download_files?: string[];
  product_id?: string;
  price?: number;
  stripe_link?: string;
  caption?: string;
  is_active: boolean;
  featured_on_homepage?: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent?: string;
  customer_email: string;
  vault_item_id: string;
  amount_paid: number;
  currency: string;
  status: string;
  download_count: number;
  created_at: string;
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
