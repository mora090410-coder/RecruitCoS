-- Migration 037: Add athlete engagement tracking and action completion records
BEGIN;

ALTER TABLE public.athletes
    ADD COLUMN IF NOT EXISTS weeks_active INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS actions_completed INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metrics_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NULL;

CREATE TABLE IF NOT EXISTS public.action_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    action_id UUID NOT NULL,
    week_start_date DATE,
    week_number INTEGER,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_action_completions_athlete_action
    ON public.action_completions(athlete_id, action_id);

CREATE INDEX IF NOT EXISTS idx_action_completions_athlete_week
    ON public.action_completions(athlete_id, week_number);

CREATE INDEX IF NOT EXISTS idx_action_completions_completed_at
    ON public.action_completions(completed_at DESC);

ALTER TABLE public.action_completions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'action_completions'
          AND policyname = 'Athletes can manage their own action completions'
    ) THEN
        CREATE POLICY "Athletes can manage their own action completions"
            ON public.action_completions
            FOR ALL
            TO authenticated
            USING (auth.uid() = athlete_id)
            WITH CHECK (auth.uid() = athlete_id);
    END IF;
END $$;

COMMIT;
