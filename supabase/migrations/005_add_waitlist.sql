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
