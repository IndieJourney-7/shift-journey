-- Migration: Add Integrity Score System
-- Run this in Supabase Dashboard → SQL Editor
--
-- This adds:
-- 1. failure_streak column to users table for consecutive failure tracking
-- 2. integrity_history table for tracking all integrity changes

-- =====================================================
-- UPDATE USERS TABLE - Add failure_streak
-- =====================================================

-- Add failure_streak column (tracks consecutive broken promises)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'failure_streak') THEN
        ALTER TABLE users ADD COLUMN failure_streak INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure integrity_score exists and has proper default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'integrity_score') THEN
        ALTER TABLE users ADD COLUMN integrity_score INTEGER DEFAULT 100;
    END IF;
END $$;

-- Add updated_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- CREATE INTEGRITY_HISTORY TABLE
-- =====================================================

-- Drop table if exists (for clean migration)
-- DROP TABLE IF EXISTS integrity_history;

CREATE TABLE IF NOT EXISTS integrity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Score tracking
    previous_score INTEGER NOT NULL,
    new_score INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,

    -- Reason for change
    reason TEXT NOT NULL CHECK (reason IN ('PROMISE_KEPT', 'PROMISE_BROKEN', 'GOAL_COMPLETED')),

    -- Context
    failure_streak INTEGER DEFAULT 0,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_integrity_history_user_id ON integrity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_integrity_history_created_at ON integrity_history(created_at);
CREATE INDEX IF NOT EXISTS idx_integrity_history_reason ON integrity_history(reason);

-- =====================================================
-- DISABLE RLS FOR ANONYMOUS ACCESS
-- =====================================================

ALTER TABLE integrity_history DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Update user integrity with validation
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_integrity(
    p_user_id UUID,
    p_new_score INTEGER,
    p_new_streak INTEGER
)
RETURNS TABLE (
    integrity_score INTEGER,
    failure_streak INTEGER
) AS $$
BEGIN
    -- Clamp score between 0 and 100
    p_new_score := GREATEST(0, LEAST(100, p_new_score));
    -- Ensure streak is non-negative
    p_new_streak := GREATEST(0, p_new_streak);

    UPDATE users
    SET
        integrity_score = p_new_score,
        failure_streak = p_new_streak,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY
    SELECT users.integrity_score, users.failure_streak
    FROM users
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$ BEGIN RAISE NOTICE 'Integrity System migration completed successfully!'; END $$;
