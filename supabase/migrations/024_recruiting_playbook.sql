-- Migration 024: Create recruiting_playbook table

CREATE TABLE IF NOT EXISTS recruiting_playbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_name TEXT NOT NULL UNIQUE,
    focus TEXT NOT NULL,
    rules JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE recruiting_playbook ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to playbook for users" ON recruiting_playbook
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seed data for the 5 phases
INSERT INTO recruiting_playbook (phase_name, focus, rules, tasks)
VALUES 
(
    'Foundation',
    'Visibility and Safety',
    '["Safety First: No personal contact info (emails/phones) in public posts for 12U athletes."]',
    '["Audit highlight vault for basic mechanics", "Create safety-first social profile", "Establish training routine focus"]'
),
(
    'Evaluation',
    'Resume Building',
    '["Focus on following target programs on X", "Engage with coach content"]',
    '["Build digital resume/profile", "Start tracking target schools", "Record full-game footage for analysis"]'
),
(
    'Identification',
    'High-Discipline Clips',
    '["The 30-Second Rule: Prioritize short, high-discipline clips in captions."]',
    '["Create 30-second highlight bursts", "Add uncommitted status to all profiles", "Identify top 20 target programs"]'
),
(
    'Comparison',
    'September 1st Protocol',
    '["September 1st Protocol: Transition tone from Grind to Proactive Outreach and culture-fit analysis."]',
    '["Prepare direct coach outreach templates", "Finalize official/unofficial visit list", "Compare roster depth at target schools"]'
),
(
    'Commitment',
    'Fit and Signing',
    '["Focus on official visits and final decision fit."]',
    '["Schedule final official visits", "Review scholarship/financial offers", "Prepare and execute Commitment Post"]'
)
ON CONFLICT (phase_name) DO UPDATE SET
    focus = EXCLUDED.focus,
    rules = EXCLUDED.rules,
    tasks = EXCLUDED.tasks;
