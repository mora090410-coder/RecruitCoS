begin;

create extension if not exists "uuid-ossp";

create table if not exists public.athlete_measurables (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  sport text not null,
  metric text not null,
  value numeric not null,
  unit text,
  verified boolean default false,
  measured_at date default current_date,
  created_at timestamptz default now()
);

create index if not exists idx_athlete_measurables_query
on public.athlete_measurables (athlete_id, sport, metric, measured_at desc);

create table if not exists public.measurable_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  sport text not null,
  position_group text not null,
  target_level text not null,
  metric text not null,
  direction text not null,
  p50 numeric,
  p75 numeric,
  p90 numeric,
  unit text,
  weight integer default 5,
  created_at timestamptz default now(),
  constraint unique_benchmark_metric unique (sport, position_group, target_level, metric)
);

commit;
