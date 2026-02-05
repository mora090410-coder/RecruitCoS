insert into public.athlete_measurables (athlete_id, sport, metric, value, unit, verified)
values ('YOUR_ATHLETE_UUID', 'softball', 'home_to_first', 3.2, 'sec', true)
returning *;
