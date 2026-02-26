-- Migration 012: Add SECURITY DEFINER RPC functions for all main tables
-- 
-- Problem: RLS policies with subqueries can be slow or block operations silently
-- Solution: Use SECURITY DEFINER functions (like find_or_create_user) that:
--   1. Bypass RLS for trusted operations
--   2. Still verify auth.uid() matches user ownership
--   3. Are much faster than complex RLS subqueries
--
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- RPC FUNCTION: create_goal (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_goal(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_target_date DATE DEFAULT NULL
)
RETURNS goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result goals;
BEGIN
  -- Verify the user making the request owns this user_id
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only create goals for yourself';
  END IF;

  INSERT INTO goals (user_id, title, description, target_date, status)
  VALUES (p_user_id, p_title, p_description, p_target_date, 'active')
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_goal TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: create_milestone (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_milestone(
  p_goal_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_number INTEGER
)
RETURNS milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result milestones;
BEGIN
  -- Verify the user making the request owns this user_id
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only create milestones for yourself';
  END IF;

  -- Verify the goal belongs to this user
  IF NOT EXISTS (SELECT 1 FROM goals WHERE id = p_goal_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Goal not found or does not belong to you';
  END IF;

  INSERT INTO milestones (goal_id, user_id, title, number, status)
  VALUES (p_goal_id, p_user_id, p_title, p_number, 'pending')
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: update_milestone (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_milestone(
  p_milestone_id UUID,
  p_title TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_promise_text TEXT DEFAULT NULL,
  p_promise_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_promise_consequence TEXT DEFAULT NULL,
  p_promise_locked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_share_id TEXT DEFAULT NULL,
  p_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_broken_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_break_reason TEXT DEFAULT NULL
)
RETURNS milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result milestones;
  v_user_id UUID;
BEGIN
  -- Get the user_id for this milestone
  SELECT user_id INTO v_user_id FROM milestones WHERE id = p_milestone_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  -- Verify the user making the request owns this milestone
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only update your own milestones';
  END IF;

  UPDATE milestones SET
    title = COALESCE(p_title, title),
    status = COALESCE(p_status, status),
    promise_text = CASE WHEN p_promise_text IS NOT NULL THEN p_promise_text ELSE promise_text END,
    promise_deadline = CASE WHEN p_promise_deadline IS NOT NULL THEN p_promise_deadline ELSE promise_deadline END,
    promise_consequence = CASE WHEN p_promise_consequence IS NOT NULL THEN p_promise_consequence ELSE promise_consequence END,
    promise_locked_at = CASE WHEN p_promise_locked_at IS NOT NULL THEN p_promise_locked_at ELSE promise_locked_at END,
    share_id = CASE WHEN p_share_id IS NOT NULL THEN p_share_id ELSE share_id END,
    completed_at = CASE WHEN p_completed_at IS NOT NULL THEN p_completed_at ELSE completed_at END,
    broken_at = CASE WHEN p_broken_at IS NOT NULL THEN p_broken_at ELSE broken_at END,
    break_reason = CASE WHEN p_break_reason IS NOT NULL THEN p_break_reason ELSE break_reason END,
    updated_at = NOW()
  WHERE id = p_milestone_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: delete_milestone (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.delete_milestone(p_milestone_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user_id for this milestone
  SELECT user_id INTO v_user_id FROM milestones WHERE id = p_milestone_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  -- Verify the user making the request owns this milestone
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own milestones';
  END IF;

  DELETE FROM milestones WHERE id = p_milestone_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: lock_milestone (SECURITY DEFINER)
-- Special function for locking a milestone with a promise
-- =====================================================
CREATE OR REPLACE FUNCTION public.lock_milestone(
  p_milestone_id UUID,
  p_promise_text TEXT,
  p_promise_deadline TIMESTAMP WITH TIME ZONE,
  p_promise_consequence TEXT
)
RETURNS milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result milestones;
  v_user_id UUID;
  v_share_id TEXT;
BEGIN
  -- Get the user_id for this milestone
  SELECT user_id INTO v_user_id FROM milestones WHERE id = p_milestone_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  -- Verify the user making the request owns this milestone
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only lock your own milestones';
  END IF;

  -- Generate share ID
  v_share_id := 'share_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || substr(md5(random()::text), 1, 9);

  UPDATE milestones SET
    status = 'locked',
    promise_text = p_promise_text,
    promise_deadline = p_promise_deadline,
    promise_consequence = p_promise_consequence,
    promise_locked_at = NOW(),
    share_id = v_share_id,
    updated_at = NOW()
  WHERE id = p_milestone_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lock_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: complete_milestone (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.complete_milestone(p_milestone_id UUID)
RETURNS milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result milestones;
  v_user_id UUID;
BEGIN
  -- Get the user_id for this milestone
  SELECT user_id INTO v_user_id FROM milestones WHERE id = p_milestone_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  -- Verify the user making the request owns this milestone
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only complete your own milestones';
  END IF;

  UPDATE milestones SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_milestone_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: break_milestone (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.break_milestone(
  p_milestone_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS milestones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result milestones;
  v_user_id UUID;
BEGIN
  -- Get the user_id for this milestone
  SELECT user_id INTO v_user_id FROM milestones WHERE id = p_milestone_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Milestone not found';
  END IF;

  -- Verify the user making the request owns this milestone
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only break your own milestones';
  END IF;

  UPDATE milestones SET
    status = 'broken',
    broken_at = NOW(),
    break_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_milestone_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.break_milestone TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: update_goal (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_goal(
  p_goal_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_reflection TEXT DEFAULT NULL,
  p_final_integrity_score INTEGER DEFAULT NULL,
  p_stats JSONB DEFAULT NULL
)
RETURNS goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result goals;
  v_user_id UUID;
BEGIN
  -- Get the user_id for this goal
  SELECT user_id INTO v_user_id FROM goals WHERE id = p_goal_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  -- Verify the user making the request owns this goal
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only update your own goals';
  END IF;

  UPDATE goals SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    status = COALESCE(p_status, status),
    completed_at = COALESCE(p_completed_at, completed_at),
    reflection = COALESCE(p_reflection, reflection),
    final_integrity_score = COALESCE(p_final_integrity_score, final_integrity_score),
    stats = COALESCE(p_stats, stats),
    updated_at = NOW()
  WHERE id = p_goal_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_goal TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: delete_goal (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.delete_goal(p_goal_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user_id for this goal
  SELECT user_id INTO v_user_id FROM goals WHERE id = p_goal_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  -- Verify the user making the request owns this goal
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own goals';
  END IF;

  -- Delete goal (cascade will remove milestones)
  DELETE FROM goals WHERE id = p_goal_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_goal TO authenticated, anon;
