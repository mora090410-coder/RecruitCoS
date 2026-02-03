-- Migration: Seed coaches table with sample data

INSERT INTO public.coaches (name, school, division, conference, sport, position, twitter_handle, region)
VALUES
  -- Softball - D1 - West Coast
  ('Sarah Johnson', 'UCLA', 'D1', 'Pac-12', 'Softball', 'Head Coach', '@UCLASoftball', 'West Coast'),
  ('Mike Davis', 'Stanford', 'D1', 'Pac-12', 'Softball', 'Head Coach', '@StanfordSB', 'West Coast'),
  ('Lisa Fernandez', 'UCLA', 'D1', 'Pac-12', 'Softball', 'Assistant Coach', '@LisaFernandez', 'West Coast'),
  ('Jessica Merchant', 'Stanford', 'D1', 'Pac-12', 'Softball', 'Assistant Coach', '@CoachMerchant', 'West Coast'),
  
  -- Softball - D1 - SEC (Southeast)
  ('Kelly Martinez', 'University of Florida', 'D1', 'SEC', 'Softball', 'Head Coach', '@GatorsSB', 'Southeast'),
  ('Patrick Murphy', 'Alabama', 'D1', 'SEC', 'Softball', 'Head Coach', '@UACoachMurphy', 'Southeast'),
  ('Karen Weekly', 'Tennessee', 'D1', 'SEC', 'Softball', 'Head Coach', '@KarenWeekly', 'Southeast'),
  ('Tim Walton', 'Florida', 'D1', 'SEC', 'Softball', 'Head Coach', '@_TimWalton', 'Southeast'),

  -- Softball - D1 - Big 12 (Southwest/Midwest)
  ('Patty Gasso', 'Oklahoma', 'D1', 'Big 12', 'Softball', 'Head Coach', '@GassoPatty', 'Southwest'),
  ('Mike White', 'Texas', 'D1', 'Big 12', 'Softball', 'Head Coach', '@CoachMikeWhite', 'Southwest'),
  ('Glenn Moore', 'Baylor', 'D1', 'Big 12', 'Softball', 'Head Coach', '@B_Official', 'Southwest'),

  -- Football - D1 - SEC
  ('Steve Sarkisian', 'Texas', 'D1', 'SEC', 'Football', 'Head Coach', '@CoachSark', 'Southwest'),
  ('Kirby Smart', 'Georgia', 'D1', 'SEC', 'Football', 'Head Coach', '@KirbySmartUGA', 'Southeast'),
  ('Nick Saban', 'Alabama', 'D1', 'SEC', 'Football', 'Head Coach', '@AlabamaFTBL', 'Southeast'),

  -- Baseball - D1
  ('David Pierce', 'Texas', 'D1', 'Big 12', 'Baseball', 'Head Coach', '@DP5hookem', 'Southwest'),
  ('Kevin O''Sullivan', 'Florida', 'D1', 'SEC', 'Baseball', 'Head Coach', '@GatorsBB', 'Southeast'),

  -- D2 / D3 / NAIA Examples
  ('John Smith', 'Angelo State', 'D2', 'Lone Star', 'Softball', 'Head Coach', '@AngeloSports', 'Southwest'),
  ('Jane Doe', 'West Texas A&M', 'D2', 'Lone Star', 'Softball', 'Recruiting Coordinator', '@WTSoftball', 'Southwest'),
  ('Bob Wilson', 'East Texas Baptist', 'D3', 'ASC', 'Softball', 'Head Coach', '@ETBUSoftball', 'Southwest'),
  ('Alice Brown', 'Mary Hardin-Baylor', 'D3', 'ASC', 'Softball', 'Head Coach', '@CruSoftball', 'Southwest')

ON CONFLICT DO NOTHING;