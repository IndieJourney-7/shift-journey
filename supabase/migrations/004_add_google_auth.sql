-- Migration: Add Google Authentication Support
-- This adds columns to support both anonymous (device_id) and authenticated (Google) users

-- Add auth columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'anonymous';

-- Index for auth_id lookups (for authenticated users)
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comment explaining the auth model
COMMENT ON COLUMN users.auth_id IS 'Supabase Auth user ID - links to auth.users table when user signs in with Google';
COMMENT ON COLUMN users.email IS 'User email from Google OAuth';
COMMENT ON COLUMN users.avatar_url IS 'Profile picture URL from Google';
COMMENT ON COLUMN users.auth_provider IS 'Authentication method: anonymous (device_id) or google';
