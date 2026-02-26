-- Migration 014: Add admin user support
-- 
-- Adds is_admin column and creates admin user seed data
--
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- STEP 1: Add is_admin column to users table
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- =====================================================
-- STEP 2: Update find_or_create_user to handle admin emails
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
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if this is an admin email
  IF p_email = 'admin@shiftascent.com' THEN
    v_is_admin := TRUE;
  END IF;

  -- 1. Find by auth_id (returning user with known auth session)
  SELECT * INTO found_user FROM users WHERE auth_id = p_auth_id;
  IF FOUND THEN
    -- Update profile info (email/avatar may have changed)
    UPDATE users SET
      email = COALESCE(p_email, email),
      full_name = CASE WHEN p_name IS NOT NULL AND p_name != 'User' THEN p_name ELSE full_name END,
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      auth_provider = p_auth_provider,
      is_admin = CASE WHEN v_is_admin THEN TRUE ELSE is_admin END,
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
      full_name = CASE WHEN p_name IS NOT NULL AND p_name != 'User' THEN p_name ELSE full_name END,
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      auth_provider = p_auth_provider,
      is_admin = CASE WHEN v_is_admin THEN TRUE ELSE is_admin END,
      updated_at = NOW()
    WHERE id = found_user.id
    RETURNING * INTO found_user;
    RETURN NEXT found_user;
    RETURN;
  END IF;

  -- 3. Find by email (existing user, new device)
  IF p_email IS NOT NULL THEN
    SELECT * INTO found_user FROM users WHERE email = p_email;
    IF FOUND THEN
      UPDATE users SET
        auth_id = p_auth_id,
        device_id = COALESCE(p_device_id, device_id),
        full_name = CASE WHEN p_name IS NOT NULL AND p_name != 'User' THEN p_name ELSE full_name END,
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        auth_provider = p_auth_provider,
        is_admin = CASE WHEN v_is_admin THEN TRUE ELSE is_admin END,
        updated_at = NOW()
      WHERE id = found_user.id
      RETURNING * INTO found_user;
      RETURN NEXT found_user;
      RETURN;
    END IF;
  END IF;

  -- 4. Create new user
  INSERT INTO users (device_id, auth_id, email, full_name, avatar_url, auth_provider, integrity_score, failure_streak, is_admin)
  VALUES (p_device_id, p_auth_id, p_email, p_name, p_avatar_url, p_auth_provider, 100, 0, v_is_admin)
  RETURNING * INTO found_user;
  RETURN NEXT found_user;
  RETURN;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.find_or_create_user TO anon, authenticated;

-- =====================================================
-- STEP 3: Update existing admin@shiftascent.com user if exists
-- =====================================================
UPDATE users SET is_admin = TRUE WHERE email = 'admin@shiftascent.com';

-- =====================================================
-- STEP 4: RPC to check admin status (for frontend)
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_user_is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM users WHERE id = p_user_id;
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_is_admin TO authenticated, anon;
