-- Migration 034: Add weekly plan items table
BEGIN;

CREATE TABLE IF NOT EXISTS public.athlete_weekly_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    priority_rank INTEGER NOT NULL CHECK (priority_rank BETWEEN 1 AND 3),
    item_type TEXT NOT NULL CHECK (item_type IN ('gap', 'strength', 'phase')),
    title TEXT NOT NULL,
    why TEXT NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'skipped')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (athlete_id, week_start_date, priority_rank)
);

CREATE INDEX IF NOT EXISTS idx_weekly_plan_items_athlete_week
    ON public.athlete_weekly_plan_items(athlete_id, week_start_date DESC);

ALTER TABLE public.athlete_weekly_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can manage their own weekly plan items"
    ON public.athlete_weekly_plan_items
    FOR ALL
    TO authenticated
    USING (auth.uid() = athlete_id)
    WITH CHECK (auth.uid() = athlete_id);

COMMENT ON TABLE public.athlete_weekly_plan_items IS 'Tracks weekly plan items with completion status for each athlete.';

COMMIT;
