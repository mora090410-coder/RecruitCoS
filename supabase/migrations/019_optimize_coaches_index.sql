-- Migration 015: Optimize Coaches Index
-- Description: Adds a composite index on sport and division to speed up the match-coaches query.

CREATE INDEX IF NOT EXISTS coaches_sport_division_idx ON public.coaches(sport, division);
