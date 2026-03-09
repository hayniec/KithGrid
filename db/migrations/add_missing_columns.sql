-- Add missing columns that exist in schema.ts but were never migrated

-- communities: has_emergency feature flag (was in schema but never migrated)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS has_emergency BOOLEAN DEFAULT true;

-- communities: HOA dues settings (were in schema but never migrated)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS hoa_dues_amount DECIMAL(10,2);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS hoa_dues_frequency TEXT DEFAULT 'Monthly';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS hoa_dues_date TEXT DEFAULT '1st';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS hoa_contact_email TEXT;

-- users table (defined in schema but never had a migration)
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL UNIQUE,
    "password" text,
    "name" text NOT NULL,
    "avatar" text,
    "created_at" timestamp DEFAULT now()
);

-- neighbors (members): add user_id, roles array, hoa_position, equipment
ALTER TABLE neighbors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE neighbors ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{Resident}';
ALTER TABLE neighbors ADD COLUMN IF NOT EXISTS hoa_position TEXT;
ALTER TABLE neighbors ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '[]'::jsonb;
