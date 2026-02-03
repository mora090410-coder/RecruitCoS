-- Migration: Add name and location columns to athletes table
-- Required for the new Onboarding Flow

ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT;
