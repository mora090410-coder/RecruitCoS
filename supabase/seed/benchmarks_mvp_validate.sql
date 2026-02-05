-- Counts by sport / position_group / target_level
SELECT sport, position_group, target_level, COUNT(*) AS metric_count
FROM public.measurable_benchmarks
WHERE target_level IN ('D1-mid', 'D2')
GROUP BY sport, position_group, target_level
ORDER BY sport, position_group, target_level;

-- No duplicate keys
SELECT sport, position_group, target_level, metric, COUNT(*) AS cnt
FROM public.measurable_benchmarks
GROUP BY sport, position_group, target_level, metric
HAVING COUNT(*) > 1;

-- Missing benchmarks referenced by sportSchema for D1-mid/D2
WITH sport_schema_metrics AS (
    SELECT 'softball' AS sport, UNNEST(ARRAY[
        'home_to_first','overhand_velocity','exit_velo','pop_time','pitch_velocity','spin_rate','strike_percentage'
    ]) AS metric
    UNION ALL
    SELECT 'baseball', UNNEST(ARRAY[
        'sixty_time','infield_velocity','outfield_velocity','exit_velocity','pop_time','catcher_throw_velocity','pitch_velocity','spin_rate','strike_percentage'
    ])
    UNION ALL
    SELECT 'football', UNNEST(ARRAY[
        'throwing_velocity','forty_time','shuttle','three_cone','vertical','bench_reps','kick_distance','hang_time','kick_accuracy'
    ])
    UNION ALL
    SELECT 'soccer', UNNEST(ARRAY[
        'sprint_30m','yo_yo','vertical_jump','agility_505'
    ])
    UNION ALL
    SELECT 'basketball', UNNEST(ARRAY[
        'three_quarter_sprint','lane_agility','vertical_jump','wingspan','height'
    ])
)
SELECT ssm.sport, ssm.metric
FROM sport_schema_metrics ssm
WHERE NOT EXISTS (
    SELECT 1
    FROM public.measurable_benchmarks mb
    WHERE mb.sport = ssm.sport
      AND mb.metric = ssm.metric
      AND mb.target_level IN ('D1-mid','D2')
)
ORDER BY ssm.sport, ssm.metric;
