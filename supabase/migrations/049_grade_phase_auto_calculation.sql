-- ============================================
-- MIGRATION 049: Grade Level & Recruiting Phase Auto-Calculation
-- Uses triggers instead of generated columns.
-- ============================================

BEGIN;

-- Step 1: Ensure grade_level + recruiting_phase exist as normal columns.
DO $$
DECLARE
    v_grade_is_generated TEXT;
    v_phase_is_generated TEXT;
BEGIN
    SELECT c.is_generated
    INTO v_grade_is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'athletes'
      AND c.column_name = 'grade_level';

    IF v_grade_is_generated = 'ALWAYS' THEN
        ALTER TABLE public.athletes DROP COLUMN grade_level;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = 'athletes'
          AND c.column_name = 'grade_level'
    ) THEN
        ALTER TABLE public.athletes ADD COLUMN grade_level INTEGER;
    END IF;

    SELECT c.is_generated
    INTO v_phase_is_generated
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'athletes'
      AND c.column_name = 'recruiting_phase';

    IF v_phase_is_generated = 'ALWAYS' THEN
        ALTER TABLE public.athletes DROP COLUMN recruiting_phase;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = 'athletes'
          AND c.column_name = 'recruiting_phase'
    ) THEN
        ALTER TABLE public.athletes ADD COLUMN recruiting_phase TEXT;
    END IF;
END $$;

-- Step 2: Calculation trigger function.
CREATE OR REPLACE FUNCTION public.calculate_athlete_grade_and_phase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INTEGER;
    years_until_grad INTEGER;
BEGIN
    IF NEW.graduation_year IS NULL THEN
        NEW.grade_level := NULL;
        NEW.recruiting_phase := NULL;
        RETURN NEW;
    END IF;

    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    years_until_grad := NEW.graduation_year - current_year;

    NEW.grade_level := 13 - years_until_grad;

    NEW.recruiting_phase := CASE
        WHEN years_until_grad >= 4 THEN 'FOUNDATION'
        WHEN years_until_grad = 3 THEN 'EVALUATION'
        WHEN years_until_grad = 2 THEN 'EXPOSURE'
        WHEN years_until_grad = 1 THEN 'COMMITMENT'
        ELSE 'POST_GRAD'
    END;

    RETURN NEW;
END;
$$;

-- Step 3: Trigger for inserts + graduation_year updates.
DROP TRIGGER IF EXISTS trigger_calculate_grade_phase ON public.athletes;
CREATE TRIGGER trigger_calculate_grade_phase
BEFORE INSERT OR UPDATE OF graduation_year
ON public.athletes
FOR EACH ROW
EXECUTE FUNCTION public.calculate_athlete_grade_and_phase();

-- Step 4: Backfill existing records.
UPDATE public.athletes
SET graduation_year = graduation_year
WHERE graduation_year IS NOT NULL;

-- Step 5: Indexes for read performance.
CREATE INDEX IF NOT EXISTS idx_athletes_grade_level
    ON public.athletes(grade_level);
CREATE INDEX IF NOT EXISTS idx_athletes_recruiting_phase
    ON public.athletes(recruiting_phase);

-- Step 6: Helper function for scheduled recalculation.
CREATE OR REPLACE FUNCTION public.recalculate_all_athlete_phases()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.athletes
    SET graduation_year = graduation_year
    WHERE graduation_year IS NOT NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

COMMIT;
