-- Migration: Standardize GPA column name in athlete_saved_schools
-- Aligns with athletes.gpa and user's expected mapping

ALTER TABLE public.athlete_saved_schools 
RENAME COLUMN gpa_requirement TO gpa;
