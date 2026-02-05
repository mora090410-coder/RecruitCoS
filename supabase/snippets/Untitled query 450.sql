select priority_rank, status, completed_at
from public.athlete_weekly_plan_items
where athlete_id = '67e3c3df-7f19-4876-a5f7-63cc958b7ed1'
and week_start_date = '2026-02-02'
order by priority_rank;
