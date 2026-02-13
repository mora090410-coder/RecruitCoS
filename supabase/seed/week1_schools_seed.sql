-- Week 1 seed: simple school catalog for self-categorization search.
-- Safe to rerun.

BEGIN;

INSERT INTO public.schools (name, city, state, division, conference)
VALUES
    -- D1
    ('University of Tennessee', 'Knoxville', 'TN', 'd1', 'SEC'),
    ('Purdue University', 'West Lafayette', 'IN', 'd1', 'Big Ten'),
    ('Indiana University', 'Bloomington', 'IN', 'd1', 'Big Ten'),
    ('Ball State University', 'Muncie', 'IN', 'd1', 'MAC'),
    ('University of Louisville', 'Louisville', 'KY', 'd1', 'ACC'),
    ('Butler University', 'Indianapolis', 'IN', 'd1', 'Big East'),
    ('Valparaiso University', 'Valparaiso', 'IN', 'd1', 'MVC'),
    ('IUPUI', 'Indianapolis', 'IN', 'd1', 'Horizon League'),
    ('University of Michigan', 'Ann Arbor', 'MI', 'd1', 'Big Ten'),
    ('Ohio State University', 'Columbus', 'OH', 'd1', 'Big Ten'),
    ('Notre Dame', 'South Bend', 'IN', 'd1', 'ACC'),
    ('Northwestern University', 'Evanston', 'IL', 'd1', 'Big Ten'),
    ('University of Illinois', 'Champaign', 'IL', 'd1', 'Big Ten'),
    ('Michigan State University', 'East Lansing', 'MI', 'd1', 'Big Ten'),
    ('University of Kentucky', 'Lexington', 'KY', 'd1', 'SEC'),
    ('Penn State University', 'University Park', 'PA', 'd1', 'Big Ten'),
    ('University of Wisconsin', 'Madison', 'WI', 'd1', 'Big Ten'),
    ('University of Minnesota', 'Minneapolis', 'MN', 'd1', 'Big Ten'),
    ('University of Iowa', 'Iowa City', 'IA', 'd1', 'Big Ten'),
    ('University of Cincinnati', 'Cincinnati', 'OH', 'd1', 'Big 12'),

    -- D2
    ('Grand Valley State University', 'Allendale', 'MI', 'd2', 'GLIAC'),
    ('Ashland University', 'Ashland', 'OH', 'd2', 'GLIAC'),
    ('University of Indianapolis', 'Indianapolis', 'IN', 'd2', 'GLVC'),
    ('Lewis University', 'Romeoville', 'IL', 'd2', 'GLVC'),
    ('Saint Joseph''s College', 'Rensselaer', 'IN', 'd2', 'GLVC'),
    ('Ferris State University', 'Big Rapids', 'MI', 'd2', 'GLIAC'),
    ('Saginaw Valley State University', 'University Center', 'MI', 'd2', 'GLIAC'),
    ('University of Findlay', 'Findlay', 'OH', 'd2', 'G-MAC'),
    ('Truman State University', 'Kirksville', 'MO', 'd2', 'GLVC'),
    ('Maryville University', 'St. Louis', 'MO', 'd2', 'GLVC'),

    -- D3
    ('Denison University', 'Granville', 'OH', 'd3', 'NCAC'),
    ('Kenyon College', 'Gambier', 'OH', 'd3', 'NCAC'),
    ('DePauw University', 'Greencastle', 'IN', 'd3', 'NCAC'),
    ('Wabash College', 'Crawfordsville', 'IN', 'd3', 'NCAC'),
    ('University of Chicago', 'Chicago', 'IL', 'd3', 'UAA'),
    ('Washington University', 'St. Louis', 'MO', 'd3', 'UAA'),
    ('Case Western Reserve University', 'Cleveland', 'OH', 'd3', 'UAA'),
    ('Ohio Wesleyan University', 'Delaware', 'OH', 'd3', 'NCAC'),
    ('Hanover College', 'Hanover', 'IN', 'd3', 'HCAC'),
    ('Rose-Hulman Institute of Technology', 'Terre Haute', 'IN', 'd3', 'HCAC'),

    -- NAIA
    ('Indiana Wesleyan University', 'Marion', 'IN', 'naia', 'Crossroads League'),
    ('Taylor University', 'Upland', 'IN', 'naia', 'Crossroads League'),
    ('Bethel University', 'Mishawaka', 'IN', 'naia', 'Crossroads League'),
    ('Marian University', 'Indianapolis', 'IN', 'naia', 'Crossroads League'),
    ('University of Saint Francis', 'Fort Wayne', 'IN', 'naia', 'Crossroads League'),
    ('Mount Vernon Nazarene University', 'Mount Vernon', 'OH', 'naia', 'Crossroads League'),

    -- JUCO
    ('Vincennes University', 'Vincennes', 'IN', 'juco', 'NJCAA'),
    ('Ivy Tech Community College', 'Indianapolis', 'IN', 'juco', 'NJCAA'),
    ('Parkland College', 'Champaign', 'IL', 'juco', 'NJCAA'),
    ('Kankakee Community College', 'Kankakee', 'IL', 'juco', 'NJCAA'),
    ('Lincoln Trail College', 'Robinson', 'IL', 'juco', 'NJCAA'),
    ('Lake Land College', 'Mattoon', 'IL', 'juco', 'NJCAA')
ON CONFLICT (name, state) DO NOTHING;

COMMIT;
