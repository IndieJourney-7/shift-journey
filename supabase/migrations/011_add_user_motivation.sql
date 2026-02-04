-- Migration: Add user motivation quote feature
-- This stores the user's personal "why" - a reminder of why they started their journey

-- =====================================================
-- USER MOTIVATION TABLE
-- Stores personal motivation - either a quote OR vision board image
-- =====================================================
CREATE TABLE IF NOT EXISTS user_motivation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Display type: 'quote' or 'image'
  display_type TEXT NOT NULL DEFAULT 'quote' CHECK (display_type IN ('quote', 'image')),
  
  -- Quote content (used when display_type = 'quote')
  heading TEXT DEFAULT 'My Why',
  quote_text TEXT,
  bg_color TEXT DEFAULT '#1a1a2e', -- Dark obsidian default
  text_color TEXT DEFAULT '#fcd34d', -- Gold default
  font_style TEXT DEFAULT 'italic' CHECK (font_style IN ('normal', 'italic', 'bold', 'bold-italic')),
  
  -- Vision board image (used when display_type = 'image')
  image_url TEXT,
  image_caption TEXT, -- Optional caption for the image
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One motivation per user
  UNIQUE(user_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_motivation_user_id ON user_motivation(user_id);

-- Enable RLS
ALTER TABLE user_motivation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own motivation" ON user_motivation
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own motivation" ON user_motivation
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own motivation" ON user_motivation
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own motivation" ON user_motivation
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_motivation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
DROP TRIGGER IF EXISTS trigger_user_motivation_updated_at ON user_motivation;
CREATE TRIGGER trigger_user_motivation_updated_at
  BEFORE UPDATE ON user_motivation
  FOR EACH ROW
  EXECUTE FUNCTION update_user_motivation_updated_at();
