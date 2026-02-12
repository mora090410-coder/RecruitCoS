-- Migration: Add Location Fields to Athletes Table

ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

-- Optional: Add index for geo-queries later
CREATE INDEX IF NOT EXISTS athletes_state_idx ON public.athletes(state);
