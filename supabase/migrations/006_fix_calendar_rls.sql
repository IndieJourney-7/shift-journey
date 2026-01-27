-- Fix: Disable RLS on calendar_data for anonymous/device-id access
-- This was originally disabled in 002_add_calendar_data.sql but schema.sql
-- re-enabled it with auth.uid() policies that don't work for anonymous users.
--
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE calendar_data DISABLE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE 'calendar_data RLS disabled for anonymous access.'; END $$;
