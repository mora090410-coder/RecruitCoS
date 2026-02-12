-- Migration 041: Restore RecruitCoS end-to-end onboarding -> weekly plan -> dashboard schema
-- This migration is additive/idempotent and preserves compatibility with the current app contract.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    parent_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.athletes
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS grade_level INTEGER,
    ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS target_division TEXT,
    ADD COLUMN IF NOT EXISTS recruiting_phase TEXT DEFAULT 'evaluation';

UPDATE public.athletes
SET user_id = id
WHERE user_id IS NULL;

-- Legacy safety: if a backfilled user_id does not exist in auth.users,
-- clear it so the FK can be added without blocking the migration.
UPDATE public.athletes a
SET user_id = NULL
WHERE a.user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM auth.users au
      WHERE au.id = a.user_id
  );

UPDATE public.athletes
SET graduation_year = grad_year
WHERE graduation_year IS NULL AND grad_year IS NOT NULL;

-- Backfill public.users for valid athlete-linked auth users.
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT
    au.id,
    COALESCE(au.email, CONCAT(au.id::TEXT, '@placeholder.invalid')),
    NOW(),
    NOW()
FROM auth.users au
JOIN (
    SELECT DISTINCT user_id
    FROM public.athletes
    WHERE user_id IS NOT NULL
) linked ON linked.user_id = au.id
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    updated_at = NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'athletes_user_id_fkey'
    ) THEN
        ALTER TABLE public.athletes
            ADD CONSTRAINT athletes_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON public.athletes (user_id);

-- ============================================
-- WEEKLY PLAN TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    sport TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    recruiting_phase TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_athlete ON public.weekly_plans (athlete_id);

-- App compatibility table (used by current weekly plan reads/writes)
CREATE TABLE IF NOT EXISTS public.athlete_weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    week_of_date DATE NOT NULL,
    week_number INTEGER,
    sport TEXT,
    grade_level INTEGER,
    recruiting_phase TEXT,
    phase TEXT,
    primary_gap_metric TEXT,
    primary_gap_band TEXT,
    primary_gap_score NUMERIC,
    summary JSONB NOT NULL DEFAULT '{}'::JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    plan_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, week_of_date)
);

CREATE INDEX IF NOT EXISTS idx_athlete_weekly_plans_athlete_week
    ON public.athlete_weekly_plans (athlete_id, week_of_date DESC);

CREATE TABLE IF NOT EXISTS public.athlete_weekly_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    weekly_plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
    week_start_date DATE,
    week_number INTEGER,
    priority_rank INTEGER CHECK (priority_rank BETWEEN 1 AND 3),
    action_number INTEGER CHECK (action_number BETWEEN 1 AND 3),
    item_type TEXT,
    action_type TEXT,
    title TEXT,
    action_title TEXT,
    why TEXT,
    action_description TEXT,
    actions JSONB NOT NULL DEFAULT '[]'::JSONB,
    estimated_minutes INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('not_started', 'in_progress', 'open', 'done', 'skipped')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, week_start_date, priority_rank),
    UNIQUE (athlete_id, week_number, action_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_plan_items_athlete_week
    ON public.athlete_weekly_plan_items (athlete_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_items_status
    ON public.athlete_weekly_plan_items (status);

CREATE TABLE IF NOT EXISTS public.action_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    action_id UUID,
    weekly_plan_item_id UUID REFERENCES public.athlete_weekly_plan_items(id) ON DELETE CASCADE,
    week_start_date DATE,
    week_number INTEGER,
    action_number INTEGER,
    action_type TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_to_complete_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_action_completions_athlete_action
    ON public.action_completions (athlete_id, action_id)
    WHERE action_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_action_completions_athlete
    ON public.action_completions (athlete_id);

-- ============================================
-- ACTION 1: ATHLETE STATS/MEASURABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.athlete_measurables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    sport TEXT,
    metric TEXT,
    value NUMERIC,
    unit TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    sixty_yard_dash DECIMAL(4,2),
    forty_yard_dash DECIMAL(4,2),
    shuttle_run DECIMAL(4,2),
    vertical_jump DECIMAL(4,2),
    broad_jump DECIMAL(5,2),
    bench_press INTEGER,
    squat INTEGER,
    deadlift INTEGER,
    recent_stats TEXT,
    measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurables_athlete ON public.athlete_measurables (athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_measurables_query
    ON public.athlete_measurables (athlete_id, sport, metric, measured_at DESC);

-- ============================================
-- ACTION 2: TARGET SCHOOLS
-- ============================================

CREATE TABLE IF NOT EXISTS public.athlete_saved_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    school_location TEXT,
    division TEXT,
    conference TEXT,
    category TEXT,
    match_score INTEGER,
    notes TEXT,
    status TEXT,
    distance_miles NUMERIC,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, school_name)
);

CREATE INDEX IF NOT EXISTS idx_saved_schools_athlete ON public.athlete_saved_schools (athlete_id);

-- ============================================
-- ACTION 3: EXPENSES
-- ============================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE,
    expense_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (date IS NOT NULL OR expense_date IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_expenses_athlete ON public.expenses (athlete_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date DESC);

-- ============================================
-- DASHBOARD TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    current_streak_weeks INTEGER NOT NULL DEFAULT 0,
    longest_streak_weeks INTEGER NOT NULL DEFAULT 0,
    last_completed_week DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL,
    score_label TEXT,
    athletic_score INTEGER,
    academic_score INTEGER,
    exposure_score INTEGER,
    division_recommendation TEXT,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readiness_scores_athlete ON public.readiness_scores (athlete_id);

-- ============================================
-- SUBSCRIPTION / BILLING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    status TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_weekly_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_measurables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_saved_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own user row" ON public.users;
CREATE POLICY "Users can manage own user row"
ON public.users
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage athletes by user_id" ON public.athletes;
CREATE POLICY "Users can manage athletes by user_id"
ON public.athletes
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR id = auth.uid())
WITH CHECK (user_id = auth.uid() OR id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own weekly_plans" ON public.weekly_plans;
CREATE POLICY "Users can manage own weekly_plans"
ON public.weekly_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = weekly_plans.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = weekly_plans.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own athlete_weekly_plans" ON public.athlete_weekly_plans;
CREATE POLICY "Users can manage own athlete_weekly_plans"
ON public.athlete_weekly_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_weekly_plans.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_weekly_plans.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own athlete_weekly_plan_items" ON public.athlete_weekly_plan_items;
CREATE POLICY "Users can manage own athlete_weekly_plan_items"
ON public.athlete_weekly_plan_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_weekly_plan_items.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_weekly_plan_items.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own action_completions" ON public.action_completions;
CREATE POLICY "Users can manage own action_completions"
ON public.action_completions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = action_completions.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = action_completions.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own athlete_measurables" ON public.athlete_measurables;
CREATE POLICY "Users can manage own athlete_measurables"
ON public.athlete_measurables
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_measurables.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_measurables.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own athlete_saved_schools" ON public.athlete_saved_schools;
CREATE POLICY "Users can manage own athlete_saved_schools"
ON public.athlete_saved_schools
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_saved_schools.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = athlete_saved_schools.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
CREATE POLICY "Users can manage own expenses"
ON public.expenses
FOR ALL
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = expenses.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = expenses.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own user_streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own user_streaks"
ON public.user_streaks
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own readiness_scores" ON public.readiness_scores;
CREATE POLICY "Users can manage own readiness_scores"
ON public.readiness_scores
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = readiness_scores.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = readiness_scores.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage own subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.create_initial_weekly_plan(p_athlete_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_weekly_plan_id UUID;
    v_sport TEXT;
    v_grade_level INTEGER;
    v_phase TEXT;
    v_week_start DATE;
BEGIN
    SELECT sport, COALESCE(grade_level, 9), COALESCE(recruiting_phase, 'evaluation')
    INTO v_sport, v_grade_level, v_phase
    FROM public.athletes
    WHERE id = p_athlete_id;

    IF v_sport IS NULL THEN
        RAISE EXCEPTION 'Athlete % not found or missing sport', p_athlete_id;
    END IF;

    v_week_start := date_trunc('week', CURRENT_DATE)::DATE;

    INSERT INTO public.weekly_plans (athlete_id, week_number, sport, grade_level, recruiting_phase)
    VALUES (p_athlete_id, 1, v_sport, v_grade_level, v_phase)
    ON CONFLICT (athlete_id, week_number) DO UPDATE
    SET recruiting_phase = EXCLUDED.recruiting_phase
    RETURNING id INTO v_weekly_plan_id;

    INSERT INTO public.athlete_weekly_plan_items (
        athlete_id, weekly_plan_id, week_start_date, week_number,
        priority_rank, action_number, item_type, action_type,
        title, action_title, why, action_description, estimated_minutes, status
    ) VALUES
    (
        p_athlete_id, v_weekly_plan_id, v_week_start, 1,
        1, 1, 'gap', 'update_stats',
        'Update your athlete''s current stats',
        'Update your athlete''s current stats',
        'Add latest measurable data to improve recruiting accuracy.',
        'Add their latest speed/strength/performance numbers so we can track progress.',
        5, 'open'
    ),
    (
        p_athlete_id, v_weekly_plan_id, v_week_start, 1,
        2, 2, 'strength', 'research_schools',
        'Research 3 schools in your target division',
        'Research 3 schools in your target division',
        'Build a balanced school list aligned to your target level.',
        'Find schools that match your athlete''s level and academic profile.',
        15, 'open'
    ),
    (
        p_athlete_id, v_weekly_plan_id, v_week_start, 1,
        3, 3, 'phase', 'log_expenses',
        'Log this month''s recruiting expenses',
        'Log this month''s recruiting expenses',
        'Create visibility into recruiting spend and trends.',
        'Track showcase fees, camp costs, and travel to see where your money is going.',
        10, 'open'
    )
    ON CONFLICT (athlete_id, week_number, action_number) DO NOTHING;

    RETURN v_weekly_plan_id;
END;
$$;

-- ============================================
-- TRIGGERS / UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_expense_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.date IS NULL AND NEW.expense_date IS NOT NULL THEN
        NEW.date := NEW.expense_date;
    ELSIF NEW.expense_date IS NULL AND NEW.date IS NOT NULL THEN
        NEW.expense_date := NEW.date;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_expenses_date_columns ON public.expenses;
CREATE TRIGGER sync_expenses_date_columns
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.sync_expense_dates();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_athletes_updated_at ON public.athletes;
CREATE TRIGGER update_athletes_updated_at
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_measurables_updated_at ON public.athlete_measurables;
CREATE TRIGGER update_measurables_updated_at
BEFORE UPDATE ON public.athlete_measurables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schools_updated_at ON public.athlete_saved_schools;
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.athlete_saved_schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
