-- 1. Create athlete_gap_results
CREATE TABLE IF NOT EXISTS public.athlete_gap_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    sport TEXT NOT NULL,
    position_group TEXT NOT NULL,
    target_level TEXT NOT NULL,
    gap_score NUMERIC NOT NULL,
    details_json JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_athlete_gap_results_athlete ON public.athlete_gap_results (athlete_id, computed_at DESC);
ALTER TABLE public.athlete_gap_results DISABLE ROW LEVEL SECURITY;

-- 2. Create athlete_readiness_results
CREATE TABLE IF NOT EXISTS public.athlete_readiness_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    sport TEXT NOT NULL,
    target_level TEXT NOT NULL,
    readiness_score NUMERIC NOT NULL,
    pillars_json JSONB NOT NULL,
    narrative_json JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_athlete_readiness_results_athlete ON public.athlete_readiness_results (athlete_id, computed_at DESC);
ALTER TABLE public.athlete_readiness_results DISABLE ROW LEVEL SECURITY;

-- 3. Create athlete_school_interest_results
CREATE TABLE IF NOT EXISTS public.athlete_school_interest_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.athlete_saved_schools(id) ON DELETE CASCADE NOT NULL,
    interest_score NUMERIC NOT NULL,
    drivers_json JSONB NOT NULL,
    next_action TEXT NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(athlete_id, school_id)
);
CREATE INDEX IF NOT EXISTS idx_interest_athlete_score ON public.athlete_school_interest_results(athlete_id, interest_score DESC);
CREATE INDEX IF NOT EXISTS idx_interest_school_id ON public.athlete_school_interest_results(school_id);
ALTER TABLE public.athlete_school_interest_results DISABLE ROW LEVEL SECURITY;

-- 4. Create athlete_weekly_plans
CREATE TABLE IF NOT EXISTS public.athlete_weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    week_of_date DATE NOT NULL,
    plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(athlete_id, week_of_date)
);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_athlete_week ON public.athlete_weekly_plans(athlete_id, week_of_date DESC);
ALTER TABLE public.athlete_weekly_plans DISABLE ROW LEVEL SECURITY;