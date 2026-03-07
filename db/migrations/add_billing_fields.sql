-- Add trial and plan management fields to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'trial';

-- Set trial_ends_at for existing communities that don't have one (14-day trial from now)
UPDATE communities SET trial_ends_at = NOW() + INTERVAL '14 days' WHERE trial_ends_at IS NULL;
UPDATE communities SET plan_status = 'trial' WHERE plan_status IS NULL;
