-- Migration 039: Pivot reset - drop non-core tables.
-- Core table retained: public.athletes
-- Everything else is intentionally removed to rebuild feature-by-feature.

BEGIN;

DROP TABLE IF EXISTS public.action_completions CASCADE;
DROP TABLE IF EXISTS public.athlete_gap_results CASCADE;
DROP TABLE IF EXISTS public.athlete_interactions CASCADE;
DROP TABLE IF EXISTS public.athlete_measurables CASCADE;
DROP TABLE IF EXISTS public.athlete_readiness_results CASCADE;
DROP TABLE IF EXISTS public.athlete_saved_schools CASCADE;
DROP TABLE IF EXISTS public.athlete_school_interest_results CASCADE;
DROP TABLE IF EXISTS public.athlete_weekly_plan_items CASCADE;
DROP TABLE IF EXISTS public.athlete_weekly_plans CASCADE;
DROP TABLE IF EXISTS public.coaches CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.measurable_benchmarks CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profile_access CASCADE;
DROP TABLE IF EXISTS public.recruiting_playbook CASCADE;
DROP TABLE IF EXISTS public.search_cache CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

COMMIT;
