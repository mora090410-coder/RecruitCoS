-- Validate athlete_weekly_plans header columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'athlete_weekly_plans'
  AND column_name IN (
    'phase',
    'primary_gap_metric',
    'primary_gap_band',
    'primary_gap_score',
    'summary',
    'generated_at'
  )
ORDER BY column_name;

-- Latest header row for a given athlete_id
-- Replace ATHLETE_UUID with a UUID in Supabase SQL editor
SELECT *
FROM public.athlete_weekly_plans
WHERE athlete_id = 'ATHLETE_UUID'
ORDER BY generated_at DESC NULLS LAST
LIMIT 1;
