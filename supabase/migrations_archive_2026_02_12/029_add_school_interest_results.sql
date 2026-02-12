-- Migration: Add per-school interest results
CREATE TABLE IF NOT EXISTS public.athlete_school_interest_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.athlete_saved_schools(id) ON DELETE CASCADE NOT NULL,
    interest_score NUMERIC NOT NULL,
    drivers_json JSONB NOT NULL,
    next_action TEXT NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(athlete_id, school_id)
);

-- Enable RLS
ALTER TABLE public.athlete_school_interest_results ENABLE ROW LEVEL SECURITY;

-- Policy: Athletes can manage their own interest results
CREATE POLICY "Users can manage their own interest results" ON public.athlete_school_interest_results
    FOR ALL USING (athlete_id = auth.uid());

-- Indexes for performance and sorting
CREATE INDEX IF NOT EXISTS idx_interest_athlete_score ON public.athlete_school_interest_results(athlete_id, interest_score DESC);
CREATE INDEX IF NOT EXISTS idx_interest_school_id ON public.athlete_school_interest_results(school_id);
