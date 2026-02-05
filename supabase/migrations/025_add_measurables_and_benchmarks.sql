-- Migration: Add Athlete Measurables and Benchmarks
-- Description: Creates tables for tracking athlete performance metrics and comparing them against target benchmarks.

BEGIN;

-- A) athlete_measurables
CREATE TABLE IF NOT EXISTS public.athlete_measurables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    sport TEXT NOT NULL,
    metric TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    verified BOOLEAN DEFAULT false,
    measured_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying by athlete and metric (most recent first)
CREATE INDEX IF NOT EXISTS idx_athlete_measurables_query 
ON public.athlete_measurables (athlete_id, sport, metric, measured_at DESC);

-- B) measurable_benchmarks
CREATE TABLE IF NOT EXISTS public.measurable_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport TEXT NOT NULL,
    position_group TEXT NOT NULL,
    target_level TEXT NOT NULL,  -- e.g., D1-top, D1-mid, D2, D3, NAIA, JUCO
    metric TEXT NOT NULL,
    direction TEXT NOT NULL,     -- higher_better | lower_better
    p50 NUMERIC,
    p75 NUMERIC,
    p90 NUMERIC,
    unit TEXT,
    weight INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_benchmark_metric UNIQUE (sport, position_group, target_level, metric)
);

COMMIT;
