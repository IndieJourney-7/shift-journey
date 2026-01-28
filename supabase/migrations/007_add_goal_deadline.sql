-- Add target_date column to goals table for goal-level deadlines
-- Run this in Supabase Dashboard → SQL Editor

-- Add target_date column to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date DATE;

-- Add index for deadline queries
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

DO $$ BEGIN RAISE NOTICE 'Goal deadline column added successfully.'; END $$;
