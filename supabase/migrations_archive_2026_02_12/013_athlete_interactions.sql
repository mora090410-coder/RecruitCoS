-- Create athlete_interactions table
CREATE TABLE IF NOT EXISTS public.athlete_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.athlete_saved_schools(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    interaction_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    intensity_score INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.athlete_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for athlete_interactions

CREATE POLICY "Users can view their own interactions" ON public.athlete_interactions
    FOR SELECT USING (
        athlete_id IN (
            SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert their own interactions" ON public.athlete_interactions
    FOR INSERT WITH CHECK (
        athlete_id IN (
            SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own interactions" ON public.athlete_interactions
    FOR UPDATE USING (
        athlete_id IN (
            SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
        )
    ) WITH CHECK (
        athlete_id IN (
            SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete their own interactions" ON public.athlete_interactions
    FOR DELETE USING (
        athlete_id IN (
            SELECT id FROM public.athletes WHERE user_id = auth.uid()::text
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS athlete_interactions_athlete_id_idx ON public.athlete_interactions(athlete_id);
CREATE INDEX IF NOT EXISTS athlete_interactions_school_id_idx ON public.athlete_interactions(school_id);
