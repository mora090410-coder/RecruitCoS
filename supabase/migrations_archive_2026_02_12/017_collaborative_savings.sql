-- Migration: Add collaborative columns to athlete_saved_schools
-- Stage 4.3: Collaborative List Building

-- Add columns for collaboration
ALTER TABLE public.athlete_saved_schools 
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'dismissed'));

-- Update existing records to be 'approved' by the athlete themselves
UPDATE public.athlete_saved_schools 
SET added_by = athlete_id::uuid, approval_status = 'approved'
WHERE added_by IS NULL;

-- Refresh RLS Policies to allow managers to insert/update
DROP POLICY IF EXISTS "Athletes can manage their own saved schools" ON public.athlete_saved_schools;

CREATE POLICY "Athletes and managers can see saved schools"
ON public.athlete_saved_schools
FOR SELECT
USING (
  athlete_id = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM public.profile_access 
    WHERE athlete_id = public.athlete_saved_schools.athlete_id::uuid 
    AND manager_id = auth.uid()
  )
);

CREATE POLICY "Athletes and managers can insert saved schools"
ON public.athlete_saved_schools
FOR INSERT
WITH CHECK (
  athlete_id = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM public.profile_access 
    WHERE athlete_id = (athlete_id)::uuid 
    AND manager_id = auth.uid()
  )
);

CREATE POLICY "Athletes can update their schools or managers can update suggestions"
ON public.athlete_saved_schools
FOR UPDATE
USING (
  athlete_id = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM public.profile_access 
    WHERE athlete_id = public.athlete_saved_schools.athlete_id::uuid 
    AND manager_id = auth.uid()
  )
);

CREATE POLICY "Athletes and managers can delete saved schools"
ON public.athlete_saved_schools
FOR DELETE
USING (
  athlete_id = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM public.profile_access 
    WHERE athlete_id = public.athlete_saved_schools.athlete_id::uuid 
    AND manager_id = auth.uid()
  )
);
