-- Migration: Replace Dream School with Strategic Goals
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '{
    "division_priority": "any",
    "geographic_preference": "regional",
    "primary_objective": 50,
    "academic_interest": ""
}'::jsonb;