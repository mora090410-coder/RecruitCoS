-- Migration: Add status and updated_at to saved schools
ALTER TABLE public.athlete_saved_schools
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'no_contact',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_athlete_saved_schools_status ON public.athlete_saved_schools(status);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_saved_school_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating
CREATE OR REPLACE TRIGGER trigger_update_saved_school_timestamp
BEFORE UPDATE ON public.athlete_saved_schools
FOR EACH ROW
EXECUTE FUNCTION update_saved_school_timestamp();
