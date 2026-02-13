-- Seed file: Recruiting Reality Engine school catalog (60 schools) + benchmarks + recruiting regions.
-- Safe to re-run; uses ON CONFLICT upserts.

BEGIN;

WITH school_seed AS (
    SELECT *
    FROM (
        VALUES
            -- D1 Top 25 (10)
            ('University of Tennessee', 'Knoxville', 'TN', 35.960600, -83.920700, 'd1', 'd1_top25', 'SEC', 31500, ARRAY['softball','baseball','football','basketball'], 36700),
            ('Stanford University', 'Stanford', 'CA', 37.427500, -122.169700, 'd1', 'd1_top25', 'ACC', 84120, ARRAY['softball','baseball','football','basketball'], 17700),
            ('University of California, Los Angeles', 'Los Angeles', 'CA', 34.068900, -118.445200, 'd1', 'd1_top25', 'Big Ten', 43400, ARRAY['softball','baseball','football','basketball'], 46400),
            ('Duke University', 'Durham', 'NC', 36.001400, -78.938200, 'd1', 'd1_top25', 'ACC', 86200, ARRAY['softball','baseball','football','basketball'], 17800),
            ('University of Oklahoma', 'Norman', 'OK', 35.205900, -97.445700, 'd1', 'd1_top25', 'SEC', 30700, ARRAY['softball','baseball','football','basketball'], 28500),
            ('University of Florida', 'Gainesville', 'FL', 29.643600, -82.354900, 'd1', 'd1_top25', 'SEC', 28600, ARRAY['softball','baseball','football','basketball'], 60200),
            ('University of Texas at Austin', 'Austin', 'TX', 30.284900, -97.734100, 'd1', 'd1_top25', 'SEC', 30800, ARRAY['softball','baseball','football','basketball'], 52600),
            ('University of Washington', 'Seattle', 'WA', 47.655300, -122.303500, 'd1', 'd1_top25', 'Big Ten', 40900, ARRAY['softball','baseball','football','basketball'], 52600),
            ('Louisiana State University', 'Baton Rouge', 'LA', 30.413300, -91.180000, 'd1', 'd1_top25', 'SEC', 28900, ARRAY['softball','baseball','football','basketball'], 37100),
            ('University of Georgia', 'Athens', 'GA', 33.948000, -83.377300, 'd1', 'd1_top25', 'SEC', 30000, ARRAY['softball','baseball','football','basketball'], 40100),

            -- D1 Power 5 (20)
            ('Purdue University', 'West Lafayette', 'IN', 40.423700, -86.921200, 'd1', 'd1_power5', 'Big Ten', 28800, ARRAY['softball','baseball','football','basketball'], 52000),
            ('Indiana University Bloomington', 'Bloomington', 'IN', 39.165300, -86.526400, 'd1', 'd1_power5', 'Big Ten', 27200, ARRAY['softball','baseball','football','basketball'], 47900),
            ('Michigan State University', 'East Lansing', 'MI', 42.701800, -84.482200, 'd1', 'd1_power5', 'Big Ten', 29600, ARRAY['softball','baseball','football','basketball'], 50700),
            ('University of Michigan', 'Ann Arbor', 'MI', 42.278000, -83.738200, 'd1', 'd1_power5', 'Big Ten', 37200, ARRAY['softball','baseball','football','basketball'], 52100),
            ('Ohio State University', 'Columbus', 'OH', 40.007600, -83.030000, 'd1', 'd1_power5', 'Big Ten', 28700, ARRAY['softball','baseball','football','basketball'], 61100),
            ('Penn State University', 'University Park', 'PA', 40.798200, -77.859900, 'd1', 'd1_power5', 'Big Ten', 33700, ARRAY['softball','baseball','football','basketball'], 49800),
            ('University of Alabama', 'Tuscaloosa', 'AL', 33.214800, -87.539100, 'd1', 'd1_power5', 'SEC', 32000, ARRAY['softball','baseball','football','basketball'], 39400),
            ('Auburn University', 'Auburn', 'AL', 32.603000, -85.487000, 'd1', 'd1_power5', 'SEC', 32900, ARRAY['softball','baseball','football','basketball'], 31300),
            ('University of Mississippi', 'Oxford', 'MS', 34.364700, -89.538600, 'd1', 'd1_power5', 'SEC', 29800, ARRAY['softball','baseball','football','basketball'], 22800),
            ('University of South Carolina', 'Columbia', 'SC', 33.998800, -81.030000, 'd1', 'd1_power5', 'SEC', 33600, ARRAY['softball','baseball','football','basketball'], 36000),
            ('North Carolina State University', 'Raleigh', 'NC', 35.784700, -78.682100, 'd1', 'd1_power5', 'ACC', 31600, ARRAY['softball','baseball','football','basketball'], 36900),
            ('Virginia Tech', 'Blacksburg', 'VA', 37.229600, -80.423400, 'd1', 'd1_power5', 'ACC', 31300, ARRAY['softball','baseball','football','basketball'], 38600),
            ('Texas A&M University', 'College Station', 'TX', 30.618700, -96.336500, 'd1', 'd1_power5', 'SEC', 32500, ARRAY['softball','baseball','football','basketball'], 74400),
            ('Baylor University', 'Waco', 'TX', 31.549300, -97.114300, 'd1', 'd1_power5', 'Big 12', 65400, ARRAY['softball','baseball','football','basketball'], 20700),
            ('Arizona State University', 'Tempe', 'AZ', 33.424200, -111.928100, 'd1', 'd1_power5', 'Big 12', 33500, ARRAY['softball','baseball','football','basketball'], 80200),
            ('Oregon State University', 'Corvallis', 'OR', 44.563800, -123.279400, 'd1', 'd1_power5', 'Pac-12', 32100, ARRAY['softball','baseball','football','basketball'], 36500),
            ('University of Louisville', 'Louisville', 'KY', 38.215600, -85.760000, 'd1', 'd1_power5', 'ACC', 32700, ARRAY['softball','baseball','football','basketball'], 23900),
            ('Clemson University', 'Clemson', 'SC', 34.677100, -82.837400, 'd1', 'd1_power5', 'ACC', 32900, ARRAY['softball','baseball','football','basketball'], 28900),
            ('University of Wisconsin-Madison', 'Madison', 'WI', 43.076600, -89.412500, 'd1', 'd1_power5', 'Big Ten', 31300, ARRAY['softball','baseball','football','basketball'], 50400),
            ('University of Nebraska-Lincoln', 'Lincoln', 'NE', 40.820000, -96.700000, 'd1', 'd1_power5', 'Big Ten', 28200, ARRAY['softball','baseball','football','basketball'], 25400),

            -- D1 Mid-Major (10)
            ('Ball State University', 'Muncie', 'IN', 40.201700, -85.406100, 'd1', 'd1_mid_major', 'MAC', 24000, ARRAY['softball','baseball','football','basketball'], 21400),
            ('Miami University', 'Oxford', 'OH', 39.510000, -84.740000, 'd1', 'd1_mid_major', 'MAC', 36400, ARRAY['softball','baseball','football','basketball'], 19600),
            ('University of North Texas', 'Denton', 'TX', 33.210900, -97.150000, 'd1', 'd1_mid_major', 'American', 25700, ARRAY['softball','baseball','football','basketball'], 44000),
            ('University of South Alabama', 'Mobile', 'AL', 30.695400, -88.180700, 'd1', 'd1_mid_major', 'Sun Belt', 23700, ARRAY['softball','baseball','football','basketball'], 13600),
            ('Coastal Carolina University', 'Conway', 'SC', 33.793400, -79.014300, 'd1', 'd1_mid_major', 'Sun Belt', 28600, ARRAY['softball','baseball','football','basketball'], 10700),
            ('University of Louisiana at Lafayette', 'Lafayette', 'LA', 30.214100, -92.020100, 'd1', 'd1_mid_major', 'Sun Belt', 22100, ARRAY['softball','baseball','football','basketball'], 18900),
            ('Wichita State University', 'Wichita', 'KS', 37.717200, -97.295100, 'd1', 'd1_mid_major', 'American', 23600, ARRAY['softball','baseball','basketball'], 16700),
            ('University of Nevada, Reno', 'Reno', 'NV', 39.545000, -119.817000, 'd1', 'd1_mid_major', 'Mountain West', 24900, ARRAY['softball','baseball','football','basketball'], 21000),
            ('San Diego State University', 'San Diego', 'CA', 32.775700, -117.071900, 'd1', 'd1_mid_major', 'Mountain West', 30200, ARRAY['softball','baseball','football','basketball'], 37800),
            ('IU Indianapolis', 'Indianapolis', 'IN', 39.773900, -86.176000, 'd1', 'd1_mid_major', 'Horizon League', 24500, ARRAY['softball','baseball','basketball'], 25500),

            -- D2 (10)
            ('Grand Valley State University', 'Allendale', 'MI', 42.963400, -85.887200, 'd2', 'd2_high', 'GLIAC', 22000, ARRAY['softball','baseball','football','basketball'], 23100),
            ('Ashland University', 'Ashland', 'OH', 40.868700, -82.318200, 'd2', 'd2_high', 'G-MAC', 39000, ARRAY['softball','baseball','football','basketball'], 4300),
            ('Colorado School of Mines', 'Golden', 'CO', 39.751600, -105.221100, 'd2', 'd2_high', 'RMAC', 44400, ARRAY['softball','baseball','football','basketball'], 7400),
            ('University of Tampa', 'Tampa', 'FL', 27.947500, -82.466900, 'd2', 'd2_high', 'SSC', 49300, ARRAY['softball','baseball','basketball'], 11000),
            ('Bentley University', 'Waltham', 'MA', 42.388900, -71.220300, 'd2', 'd2_high', 'NE10', 57800, ARRAY['softball','baseball','basketball'], 5600),
            ('Rollins College', 'Winter Park', 'FL', 28.592200, -81.348100, 'd2', 'd2_low', 'SSC', 73900, ARRAY['softball','baseball','basketball'], 3100),
            ('West Texas A&M University', 'Canyon', 'TX', 34.981700, -101.918500, 'd2', 'd2_high', 'Lone Star', 23700, ARRAY['softball','baseball','football','basketball'], 10200),
            ('California State University, Dominguez Hills', 'Carson', 'CA', 33.864600, -118.256900, 'd2', 'd2_low', 'CCAA', 18900, ARRAY['softball','baseball','basketball'], 17100),
            ('University of Central Oklahoma', 'Edmond', 'OK', 35.656400, -97.471700, 'd2', 'd2_high', 'MIAA', 21800, ARRAY['softball','baseball','football','basketball'], 14300),
            ('Minnesota State University, Mankato', 'Mankato', 'MN', 44.147700, -93.999400, 'd2', 'd2_high', 'NSIC', 22200, ARRAY['softball','baseball','football','basketball'], 15800),

            -- D3 (10)
            ('Denison University', 'Granville', 'OH', 40.074800, -82.519900, 'd3', 'd3', 'NCAC', 58000, ARRAY['softball','baseball','football','basketball'], 2300),
            ('Kenyon College', 'Gambier', 'OH', 40.372000, -82.397000, 'd3', 'd3', 'NCAC', 81100, ARRAY['softball','baseball','basketball'], 1900),
            ('Amherst College', 'Amherst', 'MA', 42.372500, -72.518500, 'd3', 'd3', 'NESCAC', 87500, ARRAY['softball','baseball','football','basketball'], 1900),
            ('Williams College', 'Williamstown', 'MA', 42.712000, -73.203700, 'd3', 'd3', 'NESCAC', 86700, ARRAY['softball','baseball','football','basketball'], 2200),
            ('Johns Hopkins University', 'Baltimore', 'MD', 39.329900, -76.620500, 'd3', 'd3', 'Centennial', 82600, ARRAY['softball','baseball','football','basketball'], 32000),
            ('Tufts University', 'Medford', 'MA', 42.407500, -71.119000, 'd3', 'd3', 'NESCAC', 84900, ARRAY['softball','baseball','football','basketball'], 13100),
            ('Emory University', 'Atlanta', 'GA', 33.792500, -84.323800, 'd3', 'd3', 'UAA', 82000, ARRAY['softball','baseball','basketball'], 15400),
            ('Claremont-Mudd-Scripps', 'Claremont', 'CA', 34.101800, -117.709600, 'd3', 'd3', 'SCIAC', 80800, ARRAY['softball','baseball','football','basketball'], 3500),
            ('DePauw University', 'Greencastle', 'IN', 39.644500, -86.864700, 'd3', 'd3', 'NCAC', 77000, ARRAY['softball','baseball','football','basketball'], 2000),
            ('Washington University in St. Louis', 'St. Louis', 'MO', 38.648800, -90.310800, 'd3', 'd3', 'UAA', 85000, ARRAY['softball','baseball','football','basketball'], 16800)
    ) AS t(
        name,
        city,
        state,
        latitude,
        longitude,
        division,
        tier,
        conference,
        cost_of_attendance,
        sports_offered,
        enrollment
    )
)
INSERT INTO public.schools (
    name,
    city,
    state,
    latitude,
    longitude,
    division,
    tier,
    conference,
    cost_of_attendance,
    sports_offered,
    enrollment
)
SELECT
    name,
    city,
    state,
    latitude,
    longitude,
    division,
    tier,
    conference,
    cost_of_attendance,
    sports_offered,
    enrollment
FROM school_seed
ON CONFLICT (name, state) DO UPDATE
SET
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    division = EXCLUDED.division,
    tier = EXCLUDED.tier,
    conference = EXCLUDED.conference,
    cost_of_attendance = EXCLUDED.cost_of_attendance,
    sports_offered = EXCLUDED.sports_offered,
    enrollment = EXCLUDED.enrollment;

WITH benchmark_inputs AS (
    SELECT
        s.id AS school_id,
        s.tier,
        sport_name::TEXT AS sport
    FROM public.schools s
    CROSS JOIN LATERAL unnest(ARRAY['softball', 'baseball', 'football']) AS sport_name
    WHERE sport_name::TEXT = ANY (s.sports_offered)
)
INSERT INTO public.school_recruiting_benchmarks (
    school_id,
    sport,
    avg_sixty_yard_dash,
    avg_vertical_jump,
    avg_gpa,
    roster_size,
    recruiting_class_size
)
SELECT
    bi.school_id,
    bi.sport,
    CASE bi.tier
        WHEN 'd1_top25' THEN 6.90
        WHEN 'd1_power5' THEN 7.20
        WHEN 'd1_mid_major' THEN 7.45
        WHEN 'd2_high' THEN 7.60
        WHEN 'd2_low' THEN 7.80
        WHEN 'd3' THEN 7.90
        WHEN 'naia' THEN 8.00
        ELSE 8.10
    END,
    CASE bi.tier
        WHEN 'd1_top25' THEN 32.0
        WHEN 'd1_power5' THEN 29.0
        WHEN 'd1_mid_major' THEN 26.5
        WHEN 'd2_high' THEN 25.0
        WHEN 'd2_low' THEN 23.5
        WHEN 'd3' THEN 22.5
        WHEN 'naia' THEN 21.5
        ELSE 20.5
    END,
    CASE bi.tier
        WHEN 'd1_top25' THEN 3.55
        WHEN 'd1_power5' THEN 3.40
        WHEN 'd1_mid_major' THEN 3.20
        WHEN 'd2_high' THEN 3.10
        WHEN 'd2_low' THEN 2.95
        WHEN 'd3' THEN 3.45
        WHEN 'naia' THEN 3.00
        ELSE 2.85
    END,
    CASE
        WHEN bi.sport = 'football' THEN 110
        WHEN bi.sport = 'baseball' THEN 40
        ELSE 26
    END,
    CASE
        WHEN bi.sport = 'football' THEN 25
        WHEN bi.sport = 'baseball' THEN 12
        ELSE 7
    END
FROM benchmark_inputs bi
ON CONFLICT (school_id, sport) DO UPDATE
SET
    avg_sixty_yard_dash = EXCLUDED.avg_sixty_yard_dash,
    avg_vertical_jump = EXCLUDED.avg_vertical_jump,
    avg_gpa = EXCLUDED.avg_gpa,
    roster_size = EXCLUDED.roster_size,
    recruiting_class_size = EXCLUDED.recruiting_class_size;

WITH home_regions AS (
    SELECT id AS school_id, state
    FROM public.schools
)
INSERT INTO public.school_recruiting_regions (school_id, state, recruits_heavily, avg_recruits_per_year)
SELECT school_id, state, TRUE, 4
FROM home_regions
ON CONFLICT (school_id, state) DO UPDATE
SET
    recruits_heavily = EXCLUDED.recruits_heavily,
    avg_recruits_per_year = EXCLUDED.avg_recruits_per_year;

WITH state_neighbors AS (
    SELECT * FROM (
        VALUES
            ('AL', 'GA', 'FL'),
            ('AZ', 'CA', 'NM'),
            ('CA', 'AZ', 'NV'),
            ('CO', 'UT', 'NM'),
            ('FL', 'GA', 'AL'),
            ('GA', 'FL', 'SC'),
            ('IN', 'IL', 'OH'),
            ('KS', 'MO', 'OK'),
            ('KY', 'OH', 'TN'),
            ('LA', 'TX', 'MS'),
            ('MA', 'CT', 'NH'),
            ('MD', 'PA', 'VA'),
            ('MI', 'IN', 'OH'),
            ('MN', 'WI', 'IA'),
            ('MO', 'IL', 'KS'),
            ('MS', 'AL', 'LA'),
            ('NC', 'SC', 'VA'),
            ('NE', 'IA', 'KS'),
            ('NV', 'CA', 'AZ'),
            ('OH', 'MI', 'PA'),
            ('OK', 'TX', 'AR'),
            ('OR', 'WA', 'CA'),
            ('PA', 'OH', 'NJ'),
            ('SC', 'NC', 'GA'),
            ('TN', 'GA', 'NC'),
            ('TX', 'OK', 'LA'),
            ('VA', 'NC', 'MD'),
            ('WA', 'OR', 'CA'),
            ('WI', 'MN', 'IL')
    ) AS t(state, neighbor_a, neighbor_b)
),
neighbor_rows AS (
    SELECT
        s.id AS school_id,
        unnest(ARRAY[sn.neighbor_a, sn.neighbor_b]) AS state
    FROM public.schools s
    JOIN state_neighbors sn ON sn.state = s.state
)
INSERT INTO public.school_recruiting_regions (school_id, state, recruits_heavily, avg_recruits_per_year)
SELECT school_id, state, FALSE, 1
FROM neighbor_rows
WHERE state IS NOT NULL
ON CONFLICT (school_id, state) DO UPDATE
SET
    recruits_heavily = EXCLUDED.recruits_heavily,
    avg_recruits_per_year = EXCLUDED.avg_recruits_per_year;

COMMIT;
