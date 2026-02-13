-- Migration 047: Schema alignment fixes from architecture review
-- Applies focused, idempotent changes for table shape, status normalization,
-- schools uniqueness, and subscription RLS policy hardening.

BEGIN;

-- ============================================
-- FIX 1: Remove duplicate weekly header table
-- ============================================

DROP TABLE IF EXISTS public.athlete_weekly_plans CASCADE;

-- ============================================
-- FIX 2: Standardize weekly item statuses
-- Canonical values: not_started, in_progress, done
-- ============================================

UPDATE public.athlete_weekly_plan_items
SET status = CASE
    WHEN status IS NULL THEN 'not_started'
    WHEN lower(status) IN ('open', 'skipped', 'not_started') THEN 'not_started'
    WHEN lower(status) IN ('in_progress', 'done') THEN lower(status)
    ELSE 'not_started'
END;

ALTER TABLE public.athlete_weekly_plan_items
    DROP CONSTRAINT IF EXISTS athlete_weekly_plan_items_status_check;

ALTER TABLE public.athlete_weekly_plan_items
    ADD CONSTRAINT athlete_weekly_plan_items_status_check
    CHECK (status IN ('not_started', 'in_progress', 'done'));

ALTER TABLE public.athlete_weekly_plan_items
    ALTER COLUMN status SET DEFAULT 'not_started';

-- ============================================
-- FIX 6: Keep athlete_saved_schools pure
-- Remove workflow-style fields for now
-- ============================================

ALTER TABLE public.athlete_saved_schools
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS approval_status,
    DROP COLUMN IF EXISTS research_status,
    DROP COLUMN IF EXISTS parent_approved;

-- ============================================
-- FIX 5: Schools uniqueness should be (name, state)
-- ============================================

ALTER TABLE public.schools
    DROP CONSTRAINT IF EXISTS schools_name_key;

ALTER TABLE public.schools
    DROP CONSTRAINT IF EXISTS schools_name_state_unique;

DROP INDEX IF EXISTS public.idx_schools_unique_name;
DROP INDEX IF EXISTS public.idx_schools_unique_name_state;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_name_state
    ON public.schools (name, state);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'schools_name_state_unique'
          AND conrelid = 'public.schools'::regclass
    ) THEN
        ALTER TABLE public.schools
            ADD CONSTRAINT schools_name_state_unique
            UNIQUE USING INDEX idx_schools_name_state;
    END IF;
END $$;

-- ============================================
-- FIX 7: Restrict subscription writes to service role
-- ============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMIT;
