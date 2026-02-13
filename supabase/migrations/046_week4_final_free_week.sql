-- Migration 046: Week 4 final free week (roadmap + projections + list review)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- MULTI-YEAR RECRUITING ROADMAP
-- ============================================

CREATE TABLE IF NOT EXISTS public.recruiting_roadmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

    current_grade INTEGER NOT NULL CHECK (current_grade BETWEEN 7 AND 13),
    graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2000),

    goals_by_quarter JSONB NOT NULL DEFAULT '{}'::JSONB,
    milestones JSONB NOT NULL DEFAULT '{}'::JSONB,
    budget_by_quarter JSONB NOT NULL DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_athlete
    ON public.recruiting_roadmap (athlete_id);

-- ============================================
-- FINANCIAL PROJECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.financial_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

    total_spent_to_date DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_spent_to_date >= 0),

    projected_showcase_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_showcase_annual >= 0),
    projected_camp_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_camp_annual >= 0),
    projected_travel_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_travel_annual >= 0),
    projected_equipment_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_equipment_annual >= 0),
    projected_training_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_training_annual >= 0),
    projected_other_annual DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (projected_other_annual >= 0),

    total_projected_to_commitment DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_projected_to_commitment >= 0),
    years_until_commitment INTEGER NOT NULL DEFAULT 1 CHECK (years_until_commitment >= 1),

    division_benchmark_low DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (division_benchmark_low >= 0),
    division_benchmark_high DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (division_benchmark_high >= division_benchmark_low),

    on_track BOOLEAN,
    recommendation TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_projections_athlete
    ON public.financial_projections (athlete_id);

-- ============================================
-- SCHOOL LIST REVIEW SNAPSHOTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_list_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

    total_schools INTEGER NOT NULL DEFAULT 0 CHECK (total_schools >= 0),
    dream_count INTEGER NOT NULL DEFAULT 0 CHECK (dream_count >= 0),
    target_count INTEGER NOT NULL DEFAULT 0 CHECK (target_count >= 0),
    safety_count INTEGER NOT NULL DEFAULT 0 CHECK (safety_count >= 0),

    is_balanced BOOLEAN NOT NULL DEFAULT FALSE,
    balance_issues TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    suggestions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_athlete
    ON public.school_list_reviews (athlete_id);

-- ============================================
-- RLS + POLICIES
-- ============================================

ALTER TABLE public.recruiting_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_list_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recruiting_roadmap" ON public.recruiting_roadmap;
CREATE POLICY "Users can manage own recruiting_roadmap"
ON public.recruiting_roadmap
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = recruiting_roadmap.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = recruiting_roadmap.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own financial_projections" ON public.financial_projections;
CREATE POLICY "Users can manage own financial_projections"
ON public.financial_projections
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = financial_projections.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = financial_projections.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own school_list_reviews" ON public.school_list_reviews;
CREATE POLICY "Users can manage own school_list_reviews"
ON public.school_list_reviews
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = school_list_reviews.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = school_list_reviews.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_recruiting_roadmap_updated_at ON public.recruiting_roadmap;
CREATE TRIGGER update_recruiting_roadmap_updated_at
BEFORE UPDATE ON public.recruiting_roadmap
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_projections_updated_at ON public.financial_projections;
CREATE TRIGGER update_financial_projections_updated_at
BEFORE UPDATE ON public.financial_projections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
