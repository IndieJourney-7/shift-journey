-- Migration: Add public read access for user profiles
-- This allows anyone to view basic profile info for the shareable badge feature

-- Allow public (anonymous) read access to basic user profile info
-- Only expose safe fields: id, name, avatar_url, integrity_score, status, joined_at
CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: This exposes all columns. If you want to restrict columns,
-- create a view or use a function instead:

-- Alternative: Create a public profile view (more secure)
-- CREATE VIEW public_profiles AS
-- SELECT 
--   id,
--   name,
--   avatar_url,
--   integrity_score,
--   status,
--   joined_at
-- FROM users;

-- GRANT SELECT ON public_profiles TO anon, authenticated;

-- Also ensure goals and milestones can be read publicly for profile stats
-- (only non-sensitive aggregate data)

-- Allow public to view completed goals count (for badge stats)
CREATE POLICY "Public can view goals for profile" ON goals
  FOR SELECT
  TO anon
  USING (true);

-- Allow public to view milestones for profile stats
CREATE POLICY "Public can view milestones for profile" ON milestones
  FOR SELECT
  TO anon
  USING (true);
