-- Add subscription plan column to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter';

-- Add logo, banner and customization columns
ALTER TABLE public.restaurant_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS custom_welcome_text TEXT;

-- Add discount and loyalty columns to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS discount_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_discount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_email_for_loyalty TEXT,
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Update notification_hours column name
ALTER TABLE public.restaurant_settings 
RENAME COLUMN notification_hours TO notification_hours_before;

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Create loyalty_settings table
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  points_per_zloty DECIMAL(5,2) DEFAULT 1,
  levels JSONB DEFAULT '[{"name":"Brązowy","min_spent":0,"discount_percent":0},{"name":"Srebrny","min_spent":200,"discount_percent":5},{"name":"Złoty","min_spent":500,"discount_percent":10}]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer_loyalty table
CREATE TABLE IF NOT EXISTS public.customer_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_user_id, customer_email)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  restaurant_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on new tables
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS policies for discount_codes
CREATE POLICY "Users can manage own discount codes" ON public.discount_codes
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for loyalty_settings
CREATE POLICY "Users can manage own loyalty settings" ON public.loyalty_settings
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for customer_loyalty
CREATE POLICY "Users can view own customer loyalty" ON public.customer_loyalty
  FOR SELECT USING (auth.uid() = restaurant_user_id);

CREATE POLICY "System can insert customer loyalty" ON public.customer_loyalty
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update customer loyalty" ON public.customer_loyalty
  FOR UPDATE USING (true);

-- RLS policies for reviews
CREATE POLICY "Anyone can view public reviews" ON public.reviews
  FOR SELECT USING (is_public = true OR auth.uid() = restaurant_user_id);

CREATE POLICY "System can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = restaurant_user_id);

-- RLS policies for blocked_dates
CREATE POLICY "Users can manage own blocked dates" ON public.blocked_dates
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_user ON public.discount_codes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_restaurant ON public.customer_loyalty(restaurant_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user ON public.blocked_dates(user_id, date);
