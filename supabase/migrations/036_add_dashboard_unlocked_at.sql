-- Migration 036: Add dashboard unlock timestamp for progressive disclosure
ALTER TABLE public.athletes
    ADD COLUMN IF NOT EXISTS dashboard_unlocked_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.athletes.dashboard_unlocked_at IS
    'Set once when athlete unlocks full dashboard from weekly plan.';
