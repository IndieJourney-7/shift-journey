-- Fix: RLS policies for ALL tables + RPC function for user auth
--
-- Problem: RLS policies use auth.uid() but anonymous users (device_id only)
-- have NO Supabase auth session, so auth.uid() is NULL and RLS blocks everything.
--
-- Fix:
-- 1. Create a SECURITY DEFINER RPC function that bypasses RLS for user lookup/creation
-- 2. App now uses Supabase anonymous auth so every user gets a real auth.uid()
-- 3. RLS policies correctly map auth.uid() → users.auth_id → users.id → user_id
--
-- PREREQUISITES:
--   Enable "Anonymous sign-ins" in Supabase Dashboard → Authentication → Settings
--
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- RPC FUNCTION: find_or_create_user (SECURITY DEFINER)
-- Bypasses RLS to handle user lookup, linking, and creation.
-- This is needed because:
--   - New users don't have auth_id set yet (can't pass RLS)
--   - Transitioning users need auth_id updated (can't find by device_id via RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.find_or_create_user(
  p_device_id TEXT,
  p_auth_id UUID,
  p_email TEXT DEFAULT NULL,
  p_name TEXT DEFAULT 'User',
  p_avatar_url TEXT DEFAULT NULL,
  p_auth_provider TEXT DEFAULT 'anonymous'
)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user users;
BEGIN
  -- 1. Find by auth_id (returning user with known auth session)
  SELECT * INTO found_user FROM users WHERE auth_id = p_auth_id;
  IF FOUND THEN
    -- Update profile info (email/avatar may have changed)
    UPDATE users SET
      email = COALESCE(p_email, email),
      name = CASE WHEN p_name IS NOT NULL AND p_name != 'User' THEN p_name ELSE name END,
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      auth_provider = p_auth_provider,
      updated_at = NOW()
    WHERE id = found_user.id
    RETURNING * INTO found_user;
    RETURN NEXT found_user;
    RETURN;
  END IF;

  -- 2. Find by device_id (existing anonymous user linking to auth)
  SELECT * INTO found_user FROM users WHERE device_id = p_device_id;
  IF FOUND THEN
    UPDATE users SET
      auth_id = p_auth_id,
      email = COALESCE(p_email, email),
      name = CASE WHEN p_name IS NOT NULL AND p_name != 'User' THEN p_name ELSE name END,
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      auth_provider = p_auth_provider,
      updated_at = NOW()
    WHERE id = found_user.id
    RETURNING * INTO found_user;
    RETURN NEXT found_user;
    RETURN;
  END IF;

  -- 3. Create new user
  INSERT INTO users (device_id, auth_id, email, name, avatar_url, auth_provider, integrity_score, failure_streak)
  VALUES (p_device_id, p_auth_id, p_email, p_name, p_avatar_url, p_auth_provider, 100, 0)
  RETURNING * INTO found_user;
  RETURN NEXT found_user;
  RETURN;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.find_or_create_user TO anon, authenticated;

-- =====================================================
-- USERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- =====================================================
-- GOALS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =====================================================
-- MILESTONES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON milestones;
DROP POLICY IF EXISTS "Anyone can view locked milestones for witnessing" ON milestones;

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own milestones" ON milestones
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Public milestone view for witnesses (shareable page)
CREATE POLICY "Anyone can view locked milestones for witnessing" ON milestones
  FOR SELECT USING (status = 'locked');

-- =====================================================
-- CALENDAR DATA TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own calendar data" ON calendar_data;
DROP POLICY IF EXISTS "Users can insert own calendar data" ON calendar_data;
DROP POLICY IF EXISTS "Users can update own calendar data" ON calendar_data;

ALTER TABLE calendar_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar data" ON calendar_data
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own calendar data" ON calendar_data
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own calendar data" ON calendar_data
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =====================================================
-- INTEGRITY HISTORY TABLE (created by migration 003)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own integrity history" ON integrity_history;
DROP POLICY IF EXISTS "Users can insert own integrity history" ON integrity_history;

ALTER TABLE integrity_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrity history" ON integrity_history
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own integrity history" ON integrity_history
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =====================================================
-- TABLES THAT MAY NOT EXIST (safe conditional blocks)
-- =====================================================

-- failure_history (defined in schema.sql, no migration creates it)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'failure_history') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own failure history" ON failure_history';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own failure history" ON failure_history';
    EXECUTE 'ALTER TABLE failure_history ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Users can view own failure history" ON failure_history
      FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Users can insert own failure history" ON failure_history
      FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))';
  END IF;
END $$;

-- witnesses (defined in schema.sql, no migration creates it)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'witnesses') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view witnesses" ON witnesses';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can add witness" ON witnesses';
    EXECUTE 'ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Anyone can view witnesses" ON witnesses
      FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Anyone can add witness" ON witnesses
      FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'All RLS policies and RPC function created successfully.'; END $$;
