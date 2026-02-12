-- Migration 035: Add weekly plan header fields
ALTER TABLE public.athlete_weekly_plans
    ADD COLUMN IF NOT EXISTS phase TEXT,
    ADD COLUMN IF NOT EXISTS primary_gap_metric TEXT,
    ADD COLUMN IF NOT EXISTS primary_gap_band TEXT,
    ADD COLUMN IF NOT EXISTS primary_gap_score NUMERIC,
    ADD COLUMN IF NOT EXISTS summary JSONB,
    ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.athlete_weekly_plans
SET generated_at = now()
WHERE generated_at IS NULL;
