select status, count(*) as n
from public.athlete_weekly_plan_items
where athlete_id = '67e3c3df-7f19-4876-a5f7-63cc958b7ed1'
and week_start_date = '2026-01-26'
group by status;