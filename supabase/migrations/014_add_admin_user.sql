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
-- STEP 2: Create function to initialize admin user
-- This will be called after the admin signs up via Auth
-- =====================================================
CREATE OR REPLACE FUNCTION public.make_user_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users SET is_admin = TRUE WHERE email = p_email;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.make_user_admin TO authenticated;

-- =====================================================
-- STEP 3: Auto-assign admin role for specific emails
-- This trigger will automatically make admin@shiftascent.com an admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_admin_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin for known admin emails
  IF NEW.email = 'admin@shiftascent.com' THEN
    NEW.is_admin := TRUE;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS auto_admin_assignment ON users;

-- Create trigger for new user inserts
CREATE TRIGGER auto_admin_assignment
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_email();

-- =====================================================
-- STEP 4: Update existing admin@shiftascent.com user if exists
-- =====================================================
UPDATE users SET is_admin = TRUE WHERE email = 'admin@shiftascent.com';

-- =====================================================
-- STEP 5: Create RPC to check admin status (for frontend)
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
