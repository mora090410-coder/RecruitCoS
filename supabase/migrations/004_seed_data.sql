-- Seed Data for Coaches (Sample)
INSERT INTO public.coaches (name, school, division, sport, position, twitter_handle, region)
VALUES
('Patty Gasso', 'Oklahoma', 'D1', 'Softball', 'Head Coach', '@GassoPatty', 'Midwest'),
('Tim Walton', 'Florida', 'D1', 'Softball', 'Head Coach', '@_TimWalton', 'Southeast'),
('Mike Candrea', 'Arizona', 'D1', 'Softball', 'Head Coach (Retired)', '@CoachCandreaUA', 'West Coast'),
('Example Coach D2', 'West Florida', 'D2', 'Softball', 'Head Coach', '@CoachD2', 'Southeast'),
('Example Coach D3', 'Williams College', 'D3', 'Softball', 'Head Coach', '@CoachD3', 'Northeast')
ON CONFLICT DO NOTHING;
