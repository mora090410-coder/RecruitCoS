-- Migration 042: Recruiting Reality Engine schema for Action 2 school intelligence.
-- Adds school master data, recruiting benchmarks/regions, and rich fit columns on athlete_saved_schools.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- SCHOOL MASTER DATA
-- ============================================

CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    division TEXT NOT NULL CHECK (division IN ('d1', 'd2', 'd3', 'naia', 'juco')),
    tier TEXT NOT NULL CHECK (tier IN ('d1_top25', 'd1_power5', 'd1_mid_major', 'd2_high', 'd2_low', 'd3', 'naia', 'juco')),
    conference TEXT,
    cost_of_attendance INTEGER,
    sports_offered TEXT[] NOT NULL DEFAULT '{}',
    enrollment INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_unique_name_state ON public.schools (name, state);
CREATE INDEX IF NOT EXISTS idx_schools_division ON public.schools (division);
CREATE INDEX IF NOT EXISTS idx_schools_tier ON public.schools (tier);
CREATE INDEX IF NOT EXISTS idx_schools_location ON public.schools (state);

CREATE TABLE IF NOT EXISTS public.school_recruiting_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    avg_sixty_yard_dash DECIMAL(4,2),
    avg_vertical_jump DECIMAL(4,2),
    avg_gpa DECIMAL(3,2),
    roster_size INTEGER,
    recruiting_class_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (school_id, sport)
);

CREATE INDEX IF NOT EXISTS idx_recruiting_benchmarks_sport ON public.school_recruiting_benchmarks (sport);

CREATE TABLE IF NOT EXISTS public.school_recruiting_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    recruits_heavily BOOLEAN NOT NULL DEFAULT FALSE,
    avg_recruits_per_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (school_id, state)
);

CREATE INDEX IF NOT EXISTS idx_school_regions_state ON public.school_recruiting_regions (state);

-- ============================================
-- ATHLETE SAVED SCHOOLS INTELLIGENCE COLUMNS
-- ============================================

ALTER TABLE public.athlete_saved_schools
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS athletic_fit INTEGER,
    ADD COLUMN IF NOT EXISTS geographic_fit INTEGER,
    ADD COLUMN IF NOT EXISTS academic_fit INTEGER,
    ADD COLUMN IF NOT EXISTS financial_fit INTEGER,
    ADD COLUMN IF NOT EXISTS match_category TEXT,
    ADD COLUMN IF NOT EXISTS is_dream_school BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_pivot_suggestion BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pivot_from_school_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'athlete_saved_schools_pivot_from_school_id_fkey'
    ) THEN
        ALTER TABLE public.athlete_saved_schools
            ADD CONSTRAINT athlete_saved_schools_pivot_from_school_id_fkey
            FOREIGN KEY (pivot_from_school_id)
            REFERENCES public.athlete_saved_schools(id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'athlete_saved_schools_match_category_check'
    ) THEN
        ALTER TABLE public.athlete_saved_schools
            ADD CONSTRAINT athlete_saved_schools_match_category_check
            CHECK (match_category IS NULL OR match_category IN ('DREAM', 'REACH', 'TARGET', 'SAFETY'))
            NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'athlete_saved_schools_match_category_check'
          AND convalidated = FALSE
    ) THEN
        ALTER TABLE public.athlete_saved_schools
            VALIDATE CONSTRAINT athlete_saved_schools_match_category_check;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_athlete_saved_schools_school_id ON public.athlete_saved_schools (school_id);
CREATE INDEX IF NOT EXISTS idx_athlete_saved_schools_match_category ON public.athlete_saved_schools (athlete_id, match_category);
CREATE INDEX IF NOT EXISTS idx_athlete_saved_schools_dream ON public.athlete_saved_schools (athlete_id, is_dream_school);
CREATE INDEX IF NOT EXISTS idx_athlete_saved_schools_pivot ON public.athlete_saved_schools (pivot_from_school_id);

-- ============================================
-- ROW LEVEL SECURITY (READ-ONLY CATALOG)
-- ============================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_recruiting_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_recruiting_regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read schools" ON public.schools;
CREATE POLICY "Authenticated users can read schools"
ON public.schools
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can read school recruiting benchmarks" ON public.school_recruiting_benchmarks;
CREATE POLICY "Authenticated users can read school recruiting benchmarks"
ON public.school_recruiting_benchmarks
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can read school recruiting regions" ON public.school_recruiting_regions;
CREATE POLICY "Authenticated users can read school recruiting regions"
ON public.school_recruiting_regions
FOR SELECT
TO authenticated
USING (TRUE);

COMMIT;
