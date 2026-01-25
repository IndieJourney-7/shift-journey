-- Migration: Add support for milestone system
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- UPDATE USERS TABLE (if device_id doesn't exist)
-- =====================================================

-- Add device_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'device_id') THEN
        ALTER TABLE users ADD COLUMN device_id TEXT UNIQUE;
    END IF;
END $$;

-- Add index for device_id lookups
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);

-- =====================================================
-- UPDATE MILESTONES TABLE
-- =====================================================

-- Add needs_reflection flag for broken milestones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'needs_reflection') THEN
        ALTER TABLE milestones ADD COLUMN needs_reflection BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add sort_order column for reordering milestones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'sort_order') THEN
        ALTER TABLE milestones ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add share_id for shareable links (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'share_id') THEN
        ALTER TABLE milestones ADD COLUMN share_id TEXT UNIQUE;
    END IF;
END $$;

-- =====================================================
-- UPDATE GOALS TABLE
-- =====================================================

-- Make target_date optional (if column exists and has NOT NULL)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'goals' AND column_name = 'target_date' AND is_nullable = 'NO') THEN
        ALTER TABLE goals ALTER COLUMN target_date DROP NOT NULL;
    END IF;
END $$;

-- =====================================================
-- DISABLE RLS FOR ANONYMOUS ACCESS
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$ BEGIN RAISE NOTICE 'Migration completed successfully!'; END $$;
