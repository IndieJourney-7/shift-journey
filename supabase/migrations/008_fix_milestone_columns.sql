-- Fix milestone columns - ensure break_reason column exists
-- Some databases might have broken_reason instead of break_reason
-- Run this in Supabase Dashboard → SQL Editor

-- Add break_reason column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'break_reason') THEN
        -- Check if broken_reason exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'broken_reason') THEN
            ALTER TABLE milestones RENAME COLUMN broken_reason TO break_reason;
            RAISE NOTICE 'Renamed broken_reason to break_reason';
        ELSE
            -- Neither exists, create break_reason
            ALTER TABLE milestones ADD COLUMN break_reason TEXT;
            RAISE NOTICE 'Added break_reason column';
        END IF;
    ELSE
        RAISE NOTICE 'break_reason column already exists';
    END IF;
END $$;

-- Also ensure broken_at column exists (some setups might be missing it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'milestones' AND column_name = 'broken_at') THEN
        ALTER TABLE milestones ADD COLUMN broken_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added broken_at column';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'Milestone columns verified/fixed successfully.'; END $$;
