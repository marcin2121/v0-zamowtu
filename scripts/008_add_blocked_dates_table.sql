-- Create blocked_dates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index for user_id and date combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_dates_user_date ON public.blocked_dates(user_id, date);
