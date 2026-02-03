-- Enable RLS on all tables
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies based on Clerk User ID
-- We assume the application will pass the user_id in the session or via a custom header/claim.
-- For now, we will assume a function `auth.uid()` or similar mapping, BUT since we are using Clerk, 
-- we typically sync Clerk users to a custom `auth` schema or just use the `user_id` text column.
-- 
-- STRATEGY: 
-- The `athletes` table has `user_id` which corresponds to the Clerk Subject.
-- We need to ensure that the current requesting user matches this `user_id`.
-- Since we haven't set up the Clerk-Supabase integration (custom JWT) yet, 
-- these policies are placeholders for the logic: "current_user_id() = user_id".

-- ATHLETES
CREATE POLICY "Users can view their own profile" ON public.athletes
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON public.athletes
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile" ON public.athletes
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- EVENTS
CREATE POLICY "Users can view their own events" ON public.events
    FOR SELECT USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own events" ON public.events
    FOR INSERT WITH CHECK (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

-- POSTS
CREATE POLICY "Users can view their own posts" ON public.posts
    FOR SELECT USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));

-- COACHES
-- Publicly readable by everyone (for MVP demo)
CREATE POLICY "Public users can view coaches" ON public.coaches
    FOR SELECT USING (true);

-- No insert/update/delete for normal users on coaches

-- SUBSCRIPTIONS
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()::text));
