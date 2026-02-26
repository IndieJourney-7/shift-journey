-- Migration 013: Add admin RPC functions for dashboard analytics
-- 
-- Problem: RLS policies block admin from viewing all users/goals/milestones/subscriptions
-- Solution: SECURITY DEFINER functions that bypass RLS but only for authenticated users
--
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- RPC FUNCTION: admin_get_user_count (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_user_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication (any logged-in user can view stats for now)
  -- In production, add admin role check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN (SELECT COUNT(*)::INTEGER FROM users);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_user_count TO authenticated;

-- =====================================================
-- RPC FUNCTION: admin_get_goal_stats (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_goal_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO result
  FROM goals;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_goal_stats TO authenticated;

-- =====================================================
-- RPC FUNCTION: admin_get_milestone_stats (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_milestone_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'locked', COUNT(*) FILTER (WHERE status = 'locked'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'broken', COUNT(*) FILTER (WHERE status = 'broken')
  ) INTO result
  FROM milestones;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_milestone_stats TO authenticated;

-- =====================================================
-- RPC FUNCTION: admin_get_subscription_stats (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_subscription_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_object_agg(
      COALESCE(status, 'unknown'), 
      status_count
    )
  ) INTO result
  FROM (
    SELECT status, COUNT(*) as status_count
    FROM user_subscriptions
    GROUP BY status
  ) sub;

  -- Handle empty table case
  IF result IS NULL THEN
    result := json_build_object('total', 0, 'by_status', '{}'::json);
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_subscription_stats TO authenticated;

-- =====================================================
-- RPC FUNCTION: admin_get_all_users (SECURITY DEFINER)
-- Returns list of all users for admin user management
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY SELECT * FROM users ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;

-- =====================================================
-- RPC FUNCTION: admin_get_all_subscriptions (SECURITY DEFINER)
-- Returns list of all subscriptions for admin management
-- =====================================================
CREATE OR REPLACE FUNCTION public.admin_get_all_subscriptions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_agg(row_to_json(s))
  INTO result
  FROM (
    SELECT 
      us.*,
      u.email as user_email,
      u.full_name as user_name,
      pp.name as plan_name
    FROM user_subscriptions us
    LEFT JOIN users u ON us.user_id = u.id
    LEFT JOIN pricing_plans pp ON us.plan_id = pp.id
    ORDER BY us.created_at DESC
  ) s;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_subscriptions TO authenticated;
