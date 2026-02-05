-- Add subscription plan column to restaurant_settings (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'restaurant_settings' 
    AND column_name = 'subscription_plan') 
  THEN
    ALTER TABLE public.restaurant_settings ADD COLUMN subscription_plan TEXT DEFAULT 'starter';
  END IF;
END $$;
