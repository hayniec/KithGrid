-- Add archived_at column to communities for soft-delete/archive support
ALTER TABLE communities ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
