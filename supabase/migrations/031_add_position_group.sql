-- Migration: Add structured position fields and map legacy text positions

DO $$
BEGIN
    CREATE TYPE public.position_group_enum AS ENUM ('P', 'C', 'IF', 'OF');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS primary_position_display TEXT,
ADD COLUMN IF NOT EXISTS position_group public.position_group_enum;

-- Backfill display from legacy position if missing
UPDATE public.athletes
SET primary_position_display = COALESCE(primary_position_display, position)
WHERE primary_position_display IS NULL
  AND position IS NOT NULL;

-- One-time mapping from legacy free-text positions to position_group
UPDATE public.athletes
SET position_group = CASE
    WHEN position ~* '(pitch|(^|\b)p(\b|/))' THEN 'P'::public.position_group_enum
    WHEN position ~* '(catch|(^|\b)c(\b|/))' THEN 'C'::public.position_group_enum
    WHEN position ~* '(shortstop|\bss\b|\b1b\b|\b2b\b|\b3b\b|first base|second base|third base|infield|middle infield|\bmi\b)' THEN 'IF'::public.position_group_enum
    WHEN position ~* '(outfield|left field|center field|right field|\blf\b|\bcf\b|\brf\b|\bof\b)' THEN 'OF'::public.position_group_enum
    ELSE NULL
END
WHERE position_group IS NULL
  AND position IS NOT NULL;

COMMENT ON COLUMN public.athletes.primary_position_display IS 'Human-readable primary position label from onboarding (e.g., "Shortstop").';
COMMENT ON COLUMN public.athletes.position_group IS 'Normalized position group for recompute (P, C, IF, OF).';
