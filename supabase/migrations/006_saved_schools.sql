-- Migration: Create athlete_saved_schools table for My List feature

CREATE TABLE IF NOT EXISTS public.athlete_saved_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reach', 'target', 'solid')),
  conference TEXT,
  division TEXT,
  distance_miles INTEGER,
  athletic_level TEXT,
  academic_selectivity TEXT,
  gpa_requirement DECIMAL(3,2),
  insight TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id, school_name)
);

-- Enable RLS
ALTER TABLE public.athlete_saved_schools ENABLE ROW LEVEL SECURITY;

-- Policy: Athletes can only see/modify their own saved schools
CREATE POLICY "Athletes can manage their own saved schools"
ON public.athlete_saved_schools
FOR ALL
USING (athlete_id = auth.uid()::text)
WITH CHECK (athlete_id = auth.uid()::text);
