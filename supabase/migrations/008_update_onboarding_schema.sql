-- Migration: Add missing onboarding fields and update schema
-- Correspond to the new Onboarding Flow requirements

ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS target_divisions TEXT[],
ADD COLUMN IF NOT EXISTS gpa_range TEXT,
ADD COLUMN IF NOT EXISTS preferred_regions TEXT[], 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distance_preference TEXT, -- Ensure this exists (was search_preference in 005?)
ADD COLUMN IF NOT EXISTS voice_profile TEXT;

-- Add comment to clarify distance_preference vs search_preference
COMMENT ON COLUMN public.athletes.distance_preference IS 'e.g. close, regional, national';

-- Ensure gpa_range is TEXT (e.g. "3.8-4.0+")
-- existing gpa column from 004 might be numeric? 004_add_gpa_field.sql
-- Let's check 004 first? No need, adding gpa_range as dedicated column is safer.

-- Add index for target_divisions if needed for searching (gin index)
CREATE INDEX IF NOT EXISTS idx_athletes_target_divisions ON public.athletes USING GIN (target_divisions);
