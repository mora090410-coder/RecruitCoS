-- Migration: Standardize UUIDs and Remove Clerk Dependencies
-- Description: 
-- 1. Drop ALL dependent policies across all tables
-- 2. Consolidate location fields in athletes table
-- 3. Standardize athlete_saved_schools to use UUID athlete_id
-- 4. Remove Clerk-specific user_id from athletes
-- 5. Enforce strict FK constraints across all related tables
-- 6. Re-create standardized RLS policies

BEGIN;

-- 0. DROP ALL DEPENDENT POLICIES (to allow dropping/altering columns)
-- athletes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.athletes;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.athletes;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.athletes;

-- events
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- posts
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- athlete_saved_schools
DROP POLICY IF EXISTS "Athletes can view their own list" ON public.athlete_saved_schools;
DROP POLICY IF EXISTS "Athletes can manage their list" ON public.athlete_saved_schools;
DROP POLICY IF EXISTS "Athletes and managers can see saved schools" ON public.athlete_saved_schools;
DROP POLICY IF EXISTS "Athletes and managers can insert saved schools" ON public.athlete_saved_schools;
DROP POLICY IF EXISTS "Athletes can update their schools or managers can update suggestions" ON public.athlete_saved_schools;
DROP POLICY IF EXISTS "Athletes and managers can delete saved schools" ON public.athlete_saved_schools;

-- athlete_interactions
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.athlete_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.athlete_interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.athlete_interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.athlete_interactions;

-- subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- profile_access
DROP POLICY IF EXISTS "Athletes can manage access to their own profile" ON public.profile_access;

-- 1. CONSOLIDATE LOCATION FIELDS
UPDATE public.athletes 
SET 
    city = COALESCE(city, location_city),
    state = COALESCE(state, location_state)
WHERE location_city IS NOT NULL OR location_state IS NOT NULL;

ALTER TABLE public.athletes 
DROP COLUMN IF EXISTS location_city,
DROP COLUMN IF EXISTS location_state;

-- 2. STANDARDIZE ATHLETES TABLE
ALTER TABLE public.athletes 
DROP COLUMN IF EXISTS user_id;

-- 3. STANDARDIZE ATHLETE_SAVED_SCHOOLS
-- Change athlete_id from TEXT to UUID
ALTER TABLE public.athlete_saved_schools 
ALTER COLUMN athlete_id TYPE UUID USING (athlete_id::UUID);

-- 4. ENFORCE FOREIGN KEYS WITH CASCADE
ALTER TABLE public.athlete_interactions 
DROP CONSTRAINT IF EXISTS athlete_interactions_athlete_id_fkey,
ADD CONSTRAINT athlete_interactions_athlete_id_fkey 
    FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;

ALTER TABLE public.athlete_saved_schools 
DROP CONSTRAINT IF EXISTS athlete_saved_schools_athlete_id_fkey,
ADD CONSTRAINT athlete_saved_schools_athlete_id_fkey 
    FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;

ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_athlete_id_fkey,
ADD CONSTRAINT posts_athlete_id_fkey 
    FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;

ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_athlete_id_fkey,
ADD CONSTRAINT events_athlete_id_fkey 
    FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;

-- 5. RE-CREATE STANDARDIZED RLS POLICIES

-- ATHLETES
CREATE POLICY "Users can view their own profile" ON public.athletes
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.athletes
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.athletes
    FOR INSERT WITH CHECK (id = auth.uid());

-- EVENTS
CREATE POLICY "Users can view their own events" ON public.events
    FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "Users can insert their own events" ON public.events
    FOR INSERT WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (athlete_id = auth.uid());

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (athlete_id = auth.uid());

-- POSTS
CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "Users can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (athlete_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (athlete_id = auth.uid());

-- SAVED SCHOOLS
CREATE POLICY "Athletes can view their own list" ON public.athlete_saved_schools
    FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "Athletes can manage their list" ON public.athlete_saved_schools
    FOR ALL USING (athlete_id = auth.uid());

-- ATHLETE INTERACTIONS
CREATE POLICY "Users can view their own interactions" ON public.athlete_interactions
    FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "Users can manage their own interactions" ON public.athlete_interactions
    FOR ALL USING (athlete_id = auth.uid());

-- PROFILE ACCESS
CREATE POLICY "Athletes can manage access to their own profile" ON public.profile_access
    FOR ALL USING (athlete_id = auth.uid());

-- SUBSCRIPTIONS
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (athlete_id = auth.uid());

COMMIT;
