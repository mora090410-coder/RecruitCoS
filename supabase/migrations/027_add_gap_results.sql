-- Migration: Add Gap Results Table
-- Description: Stores computed gap scores for athletes compared to target levels.

BEGIN;

CREATE TABLE IF NOT EXISTS public.athlete_gap_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    sport TEXT NOT NULL,
    position_group TEXT NOT NULL,
    target_level TEXT NOT NULL,
    gap_score NUMERIC NOT NULL,
    details_json JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup of latest result per athlete
CREATE INDEX IF NOT EXISTS idx_athlete_gap_results_athlete 
ON public.athlete_gap_results (athlete_id, computed_at DESC);

-- Enable RLS
ALTER TABLE public.athlete_gap_results ENABLE ROW LEVEL SECURITY;

-- Athlete owns their results
CREATE POLICY "Users can manage their own gap results" ON public.athlete_gap_results
    FOR ALL USING (athlete_id = auth.uid());

COMMIT;
