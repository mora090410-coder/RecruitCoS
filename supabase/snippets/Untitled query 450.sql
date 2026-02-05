select metric, value, unit, measured_at
from public.athlete_measurables
where athlete_id = '67e3c3df-7f19-4876-a5f7-63cc958b7ed1'
order by measured_at desc;