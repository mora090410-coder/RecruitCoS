-- Migration: Add onboarding fields for AI context

ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS search_preference TEXT DEFAULT 'regional',
ADD COLUMN IF NOT EXISTS academic_tier TEXT,
ADD COLUMN IF NOT EXISTS dream_school TEXT;

-- Add check constraint for valid values
ALTER TABLE public.athletes 
ADD CONSTRAINT check_search_preference 
CHECK (search_preference IS NULL OR search_preference IN ('local', 'regional', 'national'));

ALTER TABLE public.athletes 
ADD CONSTRAINT check_academic_tier 
CHECK (academic_tier IS NULL OR academic_tier IN ('highly_selective', 'selective', 'moderately_selective', 'open_admission'));
