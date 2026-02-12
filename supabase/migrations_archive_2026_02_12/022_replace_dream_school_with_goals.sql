-- Migration: Replace Dream School with Strategic Goals (Iconic Refinement)
BEGIN;

-- 1. Add the goals column with exact requested schema
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '{
    "division_priority": "any",
    "geographic_preference": "national",
    "academic_interest": "",
    "primary_objective": "prestige"
}'::jsonb;

-- 2. Migrate existing dream_school data if needed (optional but good for data integrity)
-- We'll store it as 'north_star' for internal logic even if not explicitly in the core request JSON schema
-- but since the user provided a specific schema, let's stick to it and maybe add 'north_star' as an extra key.
UPDATE public.athletes
SET goals = jsonb_build_object(
    'division_priority', 'any',
    'geographic_preference', 'national',
    'academic_interest', '',
    'primary_objective', 'prestige',
    'north_star', COALESCE(dream_school, '')
)
WHERE goals IS NULL;

-- 3. Drop the old column
ALTER TABLE public.athletes 
DROP COLUMN IF EXISTS dream_school;

COMMIT;
