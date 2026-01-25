-- Calendar Data Table for Daily Tracking & Journaling
-- This table stores daily work tracking and journal entries

-- Create calendar_data table
CREATE TABLE IF NOT EXISTS calendar_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  worked BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_data_user_date ON calendar_data(user_id, date);

-- Disable RLS for anonymous access (using device_id auth)
ALTER TABLE calendar_data DISABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS calendar_data_updated_at ON calendar_data;
CREATE TRIGGER calendar_data_updated_at
  BEFORE UPDATE ON calendar_data
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_data_updated_at();
