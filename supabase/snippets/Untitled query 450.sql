select sport, position_group, target_level, metric, p50, unit
from public.measurable_benchmarks
where sport='softball' and target_level in ('D1-mid','D2')
order by target_level, position_group, metric;