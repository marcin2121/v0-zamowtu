-- Add advanced features to existing tables

-- Add columns to restaurant_settings for order management
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS pause_orders BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_dates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notification_hours INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add columns to orders for timing and notifications
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Add columns to menu_items for quick availability toggle
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 15;

-- Create menu suggestions table
CREATE TABLE IF NOT EXISTS public.menu_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ
);

-- Enable RLS on new table
ALTER TABLE public.menu_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for menu_suggestions
CREATE POLICY "Users can view own suggestions" ON public.menu_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" ON public.menu_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggestions" ON public.menu_suggestions
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled ON public.orders(restaurant_user_id, scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_suggestions_user ON public.menu_suggestions(user_id, dismissed_at);
