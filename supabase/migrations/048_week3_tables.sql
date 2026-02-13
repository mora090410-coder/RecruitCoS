-- ============================================
-- MIGRATION 048: Week 3 Tables
-- Creates school_recommendations and expense_roi_analysis tables
-- ============================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- AI School Recommendations (Week 3 Action 1)
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id),
    school_name TEXT NOT NULL,
    school_location TEXT,
    division TEXT NOT NULL,
    recommendation_reason TEXT,
    recommendation_score INTEGER CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
    recruits_from_state INTEGER,
    distance_miles INTEGER,
    avg_scholarship_amount INTEGER,
    added_to_list BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    recommended_at TIMESTAMPTZ DEFAULT NOW(),
    week_number INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_athlete
    ON public.school_recommendations(athlete_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_dismissed
    ON public.school_recommendations(dismissed);
CREATE INDEX IF NOT EXISTS idx_recommendations_week
    ON public.school_recommendations(week_number);

ALTER TABLE public.school_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own athlete recommendations" ON public.school_recommendations;
CREATE POLICY "Users can manage own athlete recommendations"
ON public.school_recommendations
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes
        WHERE athletes.id = school_recommendations.athlete_id
          AND athletes.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes
        WHERE athletes.id = school_recommendations.athlete_id
          AND athletes.user_id = auth.uid()
    )
);

-- ============================================
-- Expense ROI Analysis (Week 3 Action 2)
-- ============================================

CREATE TABLE IF NOT EXISTS public.expense_roi_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    analysis_month DATE NOT NULL,
    total_spent DECIMAL(10,2),
    showcase_spend DECIMAL(10,2),
    camp_spend DECIMAL(10,2),
    travel_spend DECIMAL(10,2),
    equipment_spend DECIMAL(10,2),
    training_spend DECIMAL(10,2),
    coach_contacts_gained INTEGER DEFAULT 0,
    schools_interested INTEGER DEFAULT 0,
    estimated_roi_score INTEGER CHECK (estimated_roi_score >= 0 AND estimated_roi_score <= 100),
    top_roi_category TEXT,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roi_analysis_athlete
    ON public.expense_roi_analysis(athlete_id);
CREATE INDEX IF NOT EXISTS idx_roi_analysis_month
    ON public.expense_roi_analysis(analysis_month);

ALTER TABLE public.expense_roi_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own athlete ROI analysis" ON public.expense_roi_analysis;
CREATE POLICY "Users can manage own athlete ROI analysis"
ON public.expense_roi_analysis
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes
        WHERE athletes.id = expense_roi_analysis.athlete_id
          AND athletes.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes
        WHERE athletes.id = expense_roi_analysis.athlete_id
          AND athletes.user_id = auth.uid()
    )
);

COMMIT;
