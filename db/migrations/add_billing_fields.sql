-- Add trial and plan management fields to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';

-- Set all existing communities to active (billing/trial disabled for now)
UPDATE communities SET plan_status = 'active' WHERE plan_status IS NULL;
