-- Migration 052: Targeted JUCO catalog backfill from unresolved NJCAA matches
-- Adds missing junior-college institutions needed for sports matching/search.

BEGIN;

INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
    ('Community College of Philadelphia', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Davidson-Davie Community College', NULL, 'NC', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Delaware County Community College', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Delaware Technical Community College', NULL, 'DE', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('El Paso Community College', NULL, 'TX', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Enterprise State Community College', NULL, 'AL', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Harrisburg Area Community College', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Johnston Community College', NULL, 'NC', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Kalamazoo Valley Community College', NULL, 'MI', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Kansas City Kansas Community College', NULL, 'KS', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Labette Community College', NULL, 'KS', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Lehigh Carbon Community College', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Luna Community College', NULL, 'NM', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Luzerne County Community College', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('North Central Texas College', NULL, 'TX', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Northeast Iowa Community College', NULL, 'IA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Northwest Iowa Community College', NULL, 'IA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Nunez Community College', NULL, 'LA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Paradise Valley Community College', NULL, 'AZ', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Pennsylvania Highlands Community College', NULL, 'PA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Reid State Community College', NULL, 'AL', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Rowan College of South Jersey-Cumberland', NULL, 'NJ', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Rowan College South Jersey - Gloucester', NULL, 'NJ', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('St. Cloud Technical & Community College', NULL, 'MN', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Tidewater Community College', NULL, 'VA', 'juco', 'NJCAA', ARRAY[]::text[]),
    ('Westchester Community College', NULL, 'NY', 'juco', 'NJCAA', ARRAY[]::text[])
ON CONFLICT (name, state) DO UPDATE
SET
    division = 'juco',
    conference = COALESCE(EXCLUDED.conference, public.schools.conference);

COMMIT;
