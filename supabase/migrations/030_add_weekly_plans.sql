-- Migration 030: Add Weekly Plans table
CREATE TABLE IF NOT EXISTS public.athlete_weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_of_date DATE NOT NULL,
    plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(athlete_id, week_of_date)
);

-- Enable RLS
ALTER TABLE public.athlete_weekly_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Athletes can view and manage their own plans
CREATE POLICY "Athletes can manage their own weekly plans"
    ON public.athlete_weekly_plans
    FOR ALL
    TO authenticated
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

-- Performance Index
CREATE INDEX idx_weekly_plans_athlete_week ON public.athlete_weekly_plans(athlete_id, week_of_date DESC);

-- Update SCHEMA_SUMMARY.md
COMMENT ON TABLE public.athlete_weekly_plans IS 'Stores dynamically generated weekly recruiting plans for athletes.';
