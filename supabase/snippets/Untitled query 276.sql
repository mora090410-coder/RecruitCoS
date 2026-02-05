select table_name
from information_schema.tables
where table_schema='public'
  and table_name in (
    'athlete_measurables',
    'measurable_benchmarks',
    'athlete_gap_results',
    'athlete_readiness_results',
    'athlete_school_interest_results',
    'athlete_weekly_plans'
  )
order by table_name;
