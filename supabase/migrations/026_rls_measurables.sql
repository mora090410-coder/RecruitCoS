-- Migration: RLS and Seeding for Measurables
-- Description: Enables RLS and seeds benchmark data for various sports and position groups.

BEGIN;

-- 1. Enable RLS
ALTER TABLE public.athlete_measurables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurable_benchmarks ENABLE ROW LEVEL SECURITY;

-- 2. Policies for athlete_measurables
-- Allow CRUD where athlete_id belongs to the current user
CREATE POLICY "Users can manage their own measurables" ON public.athlete_measurables
    FOR ALL USING (athlete_id = auth.uid());

-- 3. Policies for measurable_benchmarks
-- Read-only for authenticated users
CREATE POLICY "Authenticated users can view benchmarks" ON public.measurable_benchmarks
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Seed Benchmarks (Placeholder for generated rows)
-- Rows will be inserted for Softball, Baseball, Football, Soccer, Basketball
-- target_level values: 'D1-top', 'D1-mid', 'D2', 'D3', 'NAIA', 'JUCO'

INSERT INTO public.measurable_benchmarks (sport, position_group, target_level, metric, direction, weight)
VALUES
-- Softball
('Softball', 'C', 'D1-top', 'pop_time', 'lower_better', 5),
('Softball', 'C', 'D1-top', 'throw_velocity', 'higher_better', 5),
('Softball', 'IF', 'D1-top', 'throw_velocity', 'higher_better', 5),
('Softball', 'IF', 'D1-top', 'home_to_first', 'lower_better', 5),
('Softball', 'OF', 'D1-top', 'throw_velocity', 'higher_better', 5),
('Softball', 'OF', 'D1-top', 'home_to_first', 'lower_better', 5),
('Softball', 'P', 'D1-top', 'pitch_velocity', 'higher_better', 5),

-- Baseball
('Baseball', 'C', 'D1-top', 'pop_time', 'lower_better', 5),
('Baseball', 'C', 'D1-top', 'throw_velocity', 'higher_better', 5),
('Baseball', 'IF', 'D1-top', 'exit_velocity', 'higher_better', 5),
('Baseball', 'IF', 'D1-top', 'sixty_time', 'lower_better', 5),
('Baseball', 'OF', 'D1-top', 'exit_velocity', 'higher_better', 5),
('Baseball', 'OF', 'D1-top', 'sixty_time', 'lower_better', 5),
('Baseball', 'P', 'D1-top', 'pitch_velocity', 'higher_better', 5),

-- Football
('Football', 'QB', 'D1-top', 'throw_velocity', 'higher_better', 5),
('Football', 'RB', 'D1-top', 'forty_time', 'lower_better', 5),
('Football', 'RB', 'D1-top', 'shuttle', 'lower_better', 5),
('Football', 'WR/DB', 'D1-top', 'forty_time', 'lower_better', 5),
('Football', 'WR/DB', 'D1-top', 'shuttle', 'lower_better', 5),
('Football', 'LB', 'D1-top', 'forty_time', 'lower_better', 5),
('Football', 'LB', 'D1-top', 'shuttle', 'lower_better', 5),
('Football', 'OL/DL', 'D1-top', 'forty_time', 'lower_better', 5),
('Football', 'OL/DL', 'D1-top', 'bench_reps', 'higher_better', 5),

-- Soccer
('Soccer', 'Field', 'D1-top', 'sprint_30m', 'lower_better', 5),
('Soccer', 'Field', 'D1-top', 'yo_yo_test', 'higher_better', 5),
('Soccer', 'GK', 'D1-top', 'vertical_jump', 'higher_better', 5),
('Soccer', 'GK', 'D1-top', 'sprint_30m', 'lower_better', 5),

-- Basketball
('Basketball', 'Guard', 'D1-top', 'sprint_3_4_court', 'lower_better', 5),
('Basketball', 'Guard', 'D1-top', 'vertical_jump', 'higher_better', 5),
('Basketball', 'Wing', 'D1-top', 'sprint_3_4_court', 'lower_better', 5),
('Basketball', 'Wing', 'D1-top', 'vertical_jump', 'higher_better', 5),
('Basketball', 'Big', 'D1-top', 'vertical_jump', 'higher_better', 5),
('Basketball', 'Big', 'D1-top', 'lane_agility', 'lower_better', 5);

-- (Repeat for other target_levels: 'D1-mid', 'D2', 'D3', 'NAIA', 'JUCO')
INSERT INTO public.measurable_benchmarks (sport, position_group, target_level, metric, direction, weight)
SELECT sport, position_group, tl, metric, direction, weight
FROM public.measurable_benchmarks
CROSS JOIN (VALUES ('D1-mid'), ('D2'), ('D3'), ('NAIA'), ('JUCO')) AS levels(tl)
WHERE target_level = 'D1-top';

COMMIT;
