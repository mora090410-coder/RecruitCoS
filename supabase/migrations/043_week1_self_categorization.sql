-- Migration 043: Week 1 Action 2 simplification (self-categorized school list, no match scoring)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- ATHLETE SAVED SCHOOLS (Week 1: no scoring columns)
-- ============================================

ALTER TABLE public.athlete_saved_schools
    DROP COLUMN IF EXISTS match_score,
    DROP COLUMN IF EXISTS athletic_fit,
    DROP COLUMN IF EXISTS geographic_fit,
    DROP COLUMN IF EXISTS academic_fit,
    DROP COLUMN IF EXISTS financial_fit,
    DROP COLUMN IF EXISTS distance_miles,
    DROP COLUMN IF EXISTS is_pivot_suggestion,
    DROP COLUMN IF EXISTS pivot_from_school_id;

ALTER TABLE public.athlete_saved_schools
    ALTER COLUMN category TYPE TEXT,
    ALTER COLUMN category DROP NOT NULL;

-- Normalize legacy category values to the new Week 1 vocabulary.
UPDATE public.athlete_saved_schools
SET category = CASE
    WHEN category IS NULL THEN NULL
    WHEN lower(category) IN ('dream', 'reach') THEN 'dream'
    WHEN lower(category) = 'target' THEN 'target'
    WHEN lower(category) IN ('safety', 'solid') THEN 'safety'
    ELSE NULL
END;

ALTER TABLE public.athlete_saved_schools
    DROP CONSTRAINT IF EXISTS athlete_saved_schools_week1_category_check;

ALTER TABLE public.athlete_saved_schools
    ADD CONSTRAINT athlete_saved_schools_week1_category_check
    CHECK (category IS NULL OR category IN ('dream', 'target', 'safety'));

-- ============================================
-- SCHOOLS CATALOG (minimal Week 1 table shape)
-- ============================================

CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    city TEXT,
    state TEXT NOT NULL,
    division TEXT NOT NULL CHECK (division IN ('d1', 'd2', 'd3', 'naia', 'juco')),
    conference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If an advanced schools schema already exists, keep backward compatibility while
-- allowing minimal Week 1 inserts that only pass name/city/state/division/conference.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.schools ALTER COLUMN latitude DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.schools ALTER COLUMN longitude DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'tier'
    ) THEN
        ALTER TABLE public.schools ALTER COLUMN tier DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.schools ALTER COLUMN city DROP NOT NULL;
    END IF;
END $$;

-- Ensure ON CONFLICT (name) works for the Week 1 seed script.
WITH ranked AS (
    SELECT
        id,
        row_number() OVER (PARTITION BY lower(name) ORDER BY created_at ASC, id ASC) AS row_number_rank
    FROM public.schools
)
DELETE FROM public.schools s
USING ranked r
WHERE s.id = r.id
  AND r.row_number_rank > 1;

DROP INDEX IF EXISTS idx_schools_unique_name_state;
CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_unique_name ON public.schools (name);
CREATE INDEX IF NOT EXISTS idx_schools_division ON public.schools (division);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read schools" ON public.schools;
CREATE POLICY "Authenticated users can read schools"
ON public.schools
FOR SELECT
TO authenticated
USING (TRUE);

COMMIT;
