-- Migration 044: Week 2 recruiting foundations (coach interactions + milestones)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- COACH INTERACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.coach_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.athlete_saved_schools(id) ON DELETE CASCADE,

    coach_name TEXT,
    coach_title TEXT,
    contact_method TEXT NOT NULL CHECK (contact_method IN ('email', 'phone', 'in_person', 'showcase', 'camp')),

    interaction_date DATE NOT NULL,
    initiated_by TEXT NOT NULL CHECK (initiated_by IN ('athlete', 'coach')),
    notes TEXT,

    needs_followup BOOLEAN NOT NULL DEFAULT FALSE,
    followup_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_interactions_athlete ON public.coach_interactions (athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_school ON public.coach_interactions (school_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_followup ON public.coach_interactions (athlete_id, needs_followup, followup_date);

-- ============================================
-- RECRUITING MILESTONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.recruiting_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

    milestone_type TEXT NOT NULL CHECK (
        milestone_type IN (
            'ncaa_registration',
            'first_contact',
            'unofficial_visit',
            'official_visit',
            'offer_received',
            'commitment',
            'recruiting_email_created',
            'first_showcase',
            'first_coach_email'
        )
    ),
    milestone_date DATE,
    school_id UUID REFERENCES public.athlete_saved_schools(id) ON DELETE SET NULL,

    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_athlete ON public.recruiting_milestones (athlete_id);
CREATE INDEX IF NOT EXISTS idx_milestones_school ON public.recruiting_milestones (school_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recruiting_milestones_unique_per_type
    ON public.recruiting_milestones (athlete_id, milestone_type);

-- ============================================
-- RLS + POLICIES
-- ============================================

ALTER TABLE public.coach_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiting_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own coach_interactions" ON public.coach_interactions;
CREATE POLICY "Users can manage own coach_interactions"
ON public.coach_interactions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = coach_interactions.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = coach_interactions.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage own recruiting_milestones" ON public.recruiting_milestones;
CREATE POLICY "Users can manage own recruiting_milestones"
ON public.recruiting_milestones
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = recruiting_milestones.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.athletes a
        WHERE a.id = recruiting_milestones.athlete_id
          AND (a.user_id = auth.uid() OR a.id = auth.uid())
    )
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_coach_interactions_updated_at ON public.coach_interactions;
CREATE TRIGGER update_coach_interactions_updated_at
BEFORE UPDATE ON public.coach_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
