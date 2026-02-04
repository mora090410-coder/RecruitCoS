-- Create profile_access table for sharing athlete profiles with managers/parents
CREATE TABLE IF NOT EXISTS public.profile_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(athlete_id, manager_id)
);

-- Enable RLS
ALTER TABLE public.profile_access ENABLE ROW LEVEL SECURITY;

-- Policies for profile_access
CREATE POLICY "Athletes can manage access to their own profile"
ON public.profile_access
FOR ALL
TO authenticated
USING (
    athlete_id IN (
        SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
    )
)
WITH CHECK (
    athlete_id IN (
        SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
    )
);

CREATE POLICY "Managers can view their own access records"
ON public.profile_access
FOR SELECT
TO authenticated
USING (
    manager_id = auth.uid()
);

-- Note: We need to update existing RLS policies on other tables 
-- (athletes, events, saved_schools, interactions) to allow managers to view data.
-- This will be handled in subsequent stages or as part of a general collaboration update.
