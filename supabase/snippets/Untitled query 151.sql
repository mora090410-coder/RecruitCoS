-- Migration 038: Create expenses table for weekly action detail flow
BEGIN;

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_athlete_date
    ON public.expenses (athlete_id, date DESC);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'expenses'
          AND policyname = 'Athletes can manage their own expenses'
    ) THEN
        CREATE POLICY "Athletes can manage their own expenses"
            ON public.expenses
            FOR ALL
            TO authenticated
            USING (athlete_id = auth.uid())
            WITH CHECK (athlete_id = auth.uid());
    END IF;
END $$;

COMMIT;