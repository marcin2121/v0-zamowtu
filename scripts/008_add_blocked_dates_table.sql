-- Create blocked_dates table for managing dates when restaurant cannot accept orders

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocked dates
CREATE POLICY "Users can view own blocked dates" ON public.blocked_dates
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own blocked dates
CREATE POLICY "Users can insert own blocked dates" ON public.blocked_dates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own blocked dates
CREATE POLICY "Users can update own blocked dates" ON public.blocked_dates
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own blocked dates
CREATE POLICY "Users can delete own blocked dates" ON public.blocked_dates
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user_date ON public.blocked_dates(user_id, date);

-- Add updated_at trigger
CREATE TRIGGER update_blocked_dates_updated_at
  BEFORE UPDATE ON public.blocked_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
