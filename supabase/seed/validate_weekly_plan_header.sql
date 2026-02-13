-- Validate weekly_plans header columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'weekly_plans'
  AND column_name IN (
    'week_number',
    'sport',
    'grade_level',
    'recruiting_phase',
    'started_at',
    'completed_at'
  )
ORDER BY column_name;

-- Latest header row for a given athlete_id
-- Replace ATHLETE_UUID with a UUID in Supabase SQL editor
SELECT *
FROM public.weekly_plans
WHERE athlete_id = 'ATHLETE_UUID'
ORDER BY week_number DESC, started_at DESC NULLS LAST
LIMIT 1;
