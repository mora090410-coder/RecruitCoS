-- Migration 050: School catalog API foundation
-- Goals:
-- 1) Allow full school coverage by uniqueness on (name, state)
-- 2) Normalize sport offerings with school_sports mapping table
-- 3) Add search indexes for school lookup APIs

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure deterministic uniqueness per campus/state pair.
WITH ranked AS (
    SELECT
        id,
        row_number() OVER (
            PARTITION BY lower(name), upper(state)
            ORDER BY created_at ASC, id ASC
        ) AS row_rank
    FROM public.schools
)
DELETE FROM public.schools s
USING ranked r
WHERE s.id = r.id
  AND r.row_rank > 1;

DROP INDEX IF EXISTS idx_schools_unique_name;
CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_unique_name_state ON public.schools (name, state);

CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON public.schools USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS public.school_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (school_id, sport)
);

CREATE INDEX IF NOT EXISTS idx_school_sports_school_id ON public.school_sports (school_id);
CREATE INDEX IF NOT EXISTS idx_school_sports_sport ON public.school_sports (sport);

ALTER TABLE public.school_sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read school sports" ON public.school_sports;
CREATE POLICY "Authenticated users can read school sports"
ON public.school_sports
FOR SELECT
TO authenticated
USING (TRUE);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'schools'
          AND column_name = 'sports_offered'
    ) THEN
        INSERT INTO public.school_sports (school_id, sport)
        SELECT
            s.id,
            lower(trim(sport_name))
        FROM public.schools s
        CROSS JOIN LATERAL unnest(COALESCE(s.sports_offered, '{}')) AS sport_name
        WHERE trim(sport_name) <> ''
        ON CONFLICT (school_id, sport) DO NOTHING;
    END IF;
END $$;

COMMIT;
