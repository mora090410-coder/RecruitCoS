-- Migration: Add conference column to coaches table

ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS conference TEXT;

-- Add index for search performance
CREATE INDEX IF NOT EXISTS idx_coaches_conference ON public.coaches(conference);
