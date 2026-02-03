-- Migration: Add missing onboarding fields and update schema

ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS target_divisions TEXT[],
ADD COLUMN IF NOT EXISTS gpa_range TEXT,
ADD COLUMN IF NOT EXISTS preferred_regions TEXT[], 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distance_preference TEXT,
ADD COLUMN IF NOT EXISTS voice_profile TEXT;

COMMENT ON COLUMN public.athletes.distance_preference IS 'e.g. close, regional, national';

-- Add index for target_divisions (GIN index for array searching)
CREATE INDEX IF NOT EXISTS idx_athletes_target_divisions ON public.athletes USING GIN (target_divisions);