insert into public.athlete_measurables
(athlete_id, sport, metric, value, unit, verified)
values
('67e3c3df-7f19-4876-a5f7-63cc958b7ed1','softball','throw_velocity',57,'mph',true),
('67e3c3df-7f19-4876-a5f7-63cc958b7ed1','softball','exit_velo',63,'mph',true)
returning *;