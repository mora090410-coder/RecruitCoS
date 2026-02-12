-- Migration: Validate benchmark metric keys against sport schema (non-blocking for existing rows)

CREATE OR REPLACE FUNCTION public.is_valid_benchmark_metric(sport_input TEXT, metric_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF sport_input IS NULL OR metric_input IS NULL THEN
        RETURN FALSE;
    END IF;

    IF sport_input ILIKE 'softball' THEN
        RETURN metric_input IN ('home_to_first','pop_time','throw_velocity','exit_velo','pitch_velocity');
    ELSIF sport_input ILIKE 'baseball' THEN
        RETURN metric_input IN ('sixty_time','pop_time','catcher_throw_velocity','exit_velocity','infield_velocity','outfield_velocity','pitch_velocity');
    ELSIF sport_input ILIKE 'football' THEN
        RETURN metric_input IN ('forty_time','shuttle','three_cone','vertical','bench_reps','throwing_velocity');
    ELSIF sport_input ILIKE 'soccer' THEN
        RETURN metric_input IN ('sprint_30m','yo_yo','vertical_jump','agility_505');
    ELSIF sport_input ILIKE 'basketball' THEN
        RETURN metric_input IN ('three_quarter_sprint','lane_agility','vertical_jump','wingspan','height');
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE public.measurable_benchmarks
ADD CONSTRAINT measurable_benchmarks_metric_valid
CHECK (public.is_valid_benchmark_metric(sport, metric)) NOT VALID;
