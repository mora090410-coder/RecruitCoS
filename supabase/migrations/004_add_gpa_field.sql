-- Migration: Add GPA field to Athletes Table

ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS gpa DECIMAL(3,2);

-- Add index for filtering
CREATE INDEX IF NOT EXISTS athletes_gpa_idx ON public.athletes(gpa);
