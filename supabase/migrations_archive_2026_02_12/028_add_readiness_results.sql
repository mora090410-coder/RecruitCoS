-- Migration: Add Readiness Results Table
-- Description: Stores computed readiness scores for athletes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.athlete_readiness_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    sport TEXT NOT NULL,
    target_level TEXT NOT NULL,
    readiness_score NUMERIC NOT NULL,
    pillars_json JSONB NOT NULL,
    narrative_json JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup of latest result per athlete
CREATE INDEX IF NOT EXISTS idx_athlete_readiness_results_athlete 
ON public.athlete_readiness_results (athlete_id, computed_at DESC);

-- Enable RLS
ALTER TABLE public.athlete_readiness_results ENABLE ROW LEVEL SECURITY;

-- Athlete owns their results
CREATE POLICY "Users can manage their own readiness results" ON public.athlete_readiness_results
    FOR ALL USING (athlete_id = auth.uid());

COMMIT;
