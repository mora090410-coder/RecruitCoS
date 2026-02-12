-- Baseline 040: athletes only
-- This is the fresh starting point after archiving legacy migrations.

BEGIN;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.athletes (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  grad_year INTEGER,
  sport TEXT,
  position TEXT,
  primary_position_display TEXT,
  primary_position_canonical TEXT,
  primary_position_group TEXT,
  position_group TEXT,
  secondary_positions_canonical TEXT[] DEFAULT '{}'::TEXT[],
  secondary_position_groups TEXT[] DEFAULT '{}'::TEXT[],
  goals JSONB DEFAULT '{}'::JSONB,
  target_divisions TEXT[] DEFAULT '{}'::TEXT[],
  gpa NUMERIC(3,2),
  gpa_range TEXT,
  academic_tier TEXT,
  dream_school TEXT,
  preferred_regions TEXT[] DEFAULT '{}'::TEXT[],
  distance_preference TEXT,
  search_preference TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  voice_profile TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  weeks_active INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  metrics_count INTEGER DEFAULT 0,
  dashboard_unlocked_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.athletes;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.athletes;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.athletes;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.athletes;

CREATE POLICY "Users can view their own profile"
ON public.athletes
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.athletes
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.athletes
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON public.athletes
FOR DELETE
USING (id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_athletes_updated_at ON public.athletes (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_athletes_sport ON public.athletes (sport);
CREATE INDEX IF NOT EXISTS idx_athletes_grad_year ON public.athletes (grad_year);

DROP TRIGGER IF EXISTS update_athletes_updated_at ON public.athletes;
CREATE TRIGGER update_athletes_updated_at
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();

COMMIT;
