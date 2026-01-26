-- Waitlist table for users interested in future features
-- Created: 2025-01-26

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  notes TEXT,
  source TEXT DEFAULT 'goal_completion', -- Where the signup came from
  goals_completed INTEGER DEFAULT 1, -- Number of goals completed when signing up
  integrity_score INTEGER, -- User's integrity score at time of signup
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist(user_id);

-- Prevent duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_unique ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist (public signup)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own waitlist entry
CREATE POLICY "Users can update own waitlist entry" ON waitlist
  FOR UPDATE
  USING (user_id IS NOT NULL AND user_id IN (SELECT id FROM users WHERE device_id = current_setting('app.device_id', true)))
  WITH CHECK (user_id IS NOT NULL AND user_id IN (SELECT id FROM users WHERE device_id = current_setting('app.device_id', true)));

-- Allow reading own entry (for checking if already on waitlist)
CREATE POLICY "Users can read own waitlist entry" ON waitlist
  FOR SELECT
  USING (true);
