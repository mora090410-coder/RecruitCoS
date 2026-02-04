-- Phase 4: Trust & Security Audit & Fixes

-- 1. Secure `search_cache` (Created in Phase 3, currently has no RLS)
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own search cache" ON public.search_cache;

CREATE POLICY "Users can manage their own search cache"
ON public.search_cache
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Enforce Read-Only on `coaches` for Authenticated Users
-- Ensure we only have the SELECT policy.
DROP POLICY IF EXISTS "Public users can view coaches" ON public.coaches;

CREATE POLICY "Public users can view coaches"
ON public.coaches
FOR SELECT
USING (true);

-- 3. Verify `athlete_saved_schools` RLS (from 006_saved_schools.sql)
-- It uses athlete_id = auth.uid()::text. 
-- Just enabling it again to be sure as per audit "Hard Rule".
ALTER TABLE public.athlete_saved_schools ENABLE ROW LEVEL SECURITY;

-- 4. Verify `athletes`, `events`, `posts` RLS
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
