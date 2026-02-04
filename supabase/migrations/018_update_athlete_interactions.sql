-- Migration 014: Update athlete_interactions to support coaches
-- Description: Adds coach_id column, makes school_id nullable, and ensures exclusive arc (either school or coach).

-- 1. Add coach_id column and FK
ALTER TABLE public.athlete_interactions 
ADD COLUMN coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE;

-- 2. Make school_id nullable
ALTER TABLE public.athlete_interactions 
ALTER COLUMN school_id DROP NOT NULL;

-- 3. Add constraint to ensure either school_id OR coach_id is set (but not both? or can allow mixed? strict arc approach is usually one or the other).
-- For now, let's just ensure AT LEAST one is present.
ALTER TABLE public.athlete_interactions 
ADD CONSTRAINT athlete_interactions_target_check 
CHECK (
  (school_id IS NOT NULL AND coach_id IS NULL) OR 
  (school_id IS NULL AND coach_id IS NOT NULL)
);

-- 4. Add Index for coach_id
CREATE INDEX IF NOT EXISTS athlete_interactions_coach_id_idx ON public.athlete_interactions(coach_id);

-- 5. Update RLS policies to cover coach_id if necessary (existing policies use athlete_id so they should be fine for row access, but good to double check)
-- Existing policies rely on athlete_id, which is unchanged.

