-- Migration 045: Week 3 conversion hook (recommendations + expense ROI intelligence)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- AI SCHOOL RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,

    school_name TEXT NOT NULL,
    school_location TEXT,
    division TEXT NOT NULL CHECK (division IN ('d1', 'd2', 'd3', 'naia', 'juco')),

    recommendation_reason TEXT,
    recommendation_score INTEGER CHECK (recommendation_score BETWEEN 0 AND 100),

    recruits_from_state INTEGER CHECK (recruits_from_state IS NULL OR recruits_from_state >= 0),
    distance_miles INTEGER CHECK (distance_miles IS NULL OR distance_miles >= 0),
    avg_scholarship_amount INTEGER CHECK (avg_scholarship_amount IS NULL OR avg_scholarship_amount >= 0),

    added_to_list BOOLEAN NOT NULL DEFAULT FALSE,
    dismissed BOOLEAN NOT NULL DEFAULT FALSE,

    recommended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    week_number INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (athlete_id, week_number, school_name)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_athlete
    ON public.school_recommendations (athlete_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_dismissed
    ON public.school_recommendations (athlete_id, dismissed);
CREATE INDEX IF NOT EXISTS idx_recommendations_score
    ON public.school_recommendations (athlete_id, recommendation_score DESC);

-- ============================================
-- EXPENSE ROI ANALYSIS
-- ============================================

CREATE TABLE IF NOT EXISTS public.expense_roi_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

    analysis_month DATE NOT NULL,

    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    showcase_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (showcase_spend >= 0),
    camp_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (camp_spend >= 0),
    travel_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (travel_spend >= 0),
    equipment_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (equipment_spend >= 0),
    training_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (training_spend >= 0),

    coach_contacts_gained INTEGER NOT NULL DEFAULT 0 CHECK (coach_contacts_gained >= 0),
    schools_interested INTEGER NOT NULL DEFAULT 0 CHECK (schools_interested >= 0),
    estimated_roi_score INTEGER CHECK (estimated_roi_score BETWEEN 0 AND 100),

    top_roi_category TEXT,
    recommendation TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (athlete_id, analysis_month)
);

CREATE INDEX IF NOT EXISTS idx_roi_analysis_athlete
    ON public.expense_roi_analysis (athlete_id);

-- ============================================
-- RLS + POLICIES
-- ============================================

ALTER TABLE public.school_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_roi_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own school_recommendations" ON public.school_recommendations;
CREATE POLICY "Users can manage own school_recommendations"
ON public.school_recommendations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = school_recommendations.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = school_recommendations.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own expense_roi_analysis" ON public.expense_roi_analysis;
CREATE POLICY "Users can manage own expense_roi_analysis"
ON public.expense_roi_analysis
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = expense_roi_analysis.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = expense_roi_analysis.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_school_recommendations_updated_at ON public.school_recommendations;
CREATE TRIGGER update_school_recommendations_updated_at
BEFORE UPDATE ON public.school_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
