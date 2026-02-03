-- Phase 3: Scalability & Performance
-- 1. Create a Search Cache Table
CREATE TABLE IF NOT EXISTS search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_key TEXT NOT NULL, -- Combined hash or string of search params
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for fast cache lookups
CREATE INDEX IF NOT EXISTS idx_search_cache_lookup 
ON search_cache(user_id, query_key);

-- 2. Performance Indexes for Filters
-- Athletes Table
CREATE INDEX IF NOT EXISTS idx_athletes_search 
ON athletes(sport, grad_year, location_state);

-- Coaches Table
CREATE INDEX IF NOT EXISTS idx_coaches_filtering 
ON coaches(sport, division);

-- Saved Schools Table
CREATE INDEX IF NOT EXISTS idx_saved_schools_athlete 
ON athlete_saved_schools(athlete_id, category);

-- 3. (Optional) RPC for Distance Calculation
-- If client-side math becomes too heavy, use this PostGIS-free haversine function.
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 FLOAT, lng1 FLOAT, 
    lat2 FLOAT, lng2 FLOAT
) RETURNS FLOAT AS $$
DECLARE
    R CONSTANT INTEGER := 3959; -- Radius of Earth in miles
    dLat FLOAT;
    dLng FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    dLat := (lat2 - lat1) * PI() / 180;
    dLng := (lng2 - lng1) * PI() / 180;
    
    a := SIN(dLat/2) * SIN(dLat/2) +
         COS(lat1 * PI() / 180) * COS(lat2 * PI() / 180) *
         SIN(dLng/2) * SIN(dLng/2);
         
    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
