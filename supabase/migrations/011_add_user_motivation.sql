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

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own motivation" ON user_motivation;
DROP POLICY IF EXISTS "Users can insert own motivation" ON user_motivation;
DROP POLICY IF EXISTS "Users can update own motivation" ON user_motivation;
DROP POLICY IF EXISTS "Users can delete own motivation" ON user_motivation;
DROP POLICY IF EXISTS "Allow all for authenticated users own data" ON user_motivation;

-- Simple RLS Policy - allow all operations for user's own data
CREATE POLICY "Allow all for authenticated users own data" ON user_motivation
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- RPC FUNCTION: upsert_user_motivation (SECURITY DEFINER)
-- Bypasses RLS to handle motivation upsert reliably
-- =====================================================
CREATE OR REPLACE FUNCTION public.upsert_user_motivation(
  p_user_id UUID,
  p_display_type TEXT DEFAULT 'quote',
  p_heading TEXT DEFAULT 'My Why',
  p_quote_text TEXT DEFAULT NULL,
  p_bg_color TEXT DEFAULT '#1a1a2e',
  p_text_color TEXT DEFAULT '#fcd34d',
  p_font_style TEXT DEFAULT 'italic',
  p_image_url TEXT DEFAULT NULL,
  p_image_caption TEXT DEFAULT NULL
)
RETURNS user_motivation
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result user_motivation;
BEGIN
  -- Verify the user making the request owns this user_id
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only modify your own motivation';
  END IF;

  -- Insert or update
  INSERT INTO user_motivation (
    user_id, display_type, heading, quote_text, 
    bg_color, text_color, font_style, image_url, image_caption
  )
  VALUES (
    p_user_id, p_display_type, p_heading, p_quote_text,
    p_bg_color, p_text_color, p_font_style, p_image_url, p_image_caption
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_type = EXCLUDED.display_type,
    heading = EXCLUDED.heading,
    quote_text = EXCLUDED.quote_text,
    bg_color = EXCLUDED.bg_color,
    text_color = EXCLUDED.text_color,
    font_style = EXCLUDED.font_style,
    image_url = EXCLUDED.image_url,
    image_caption = EXCLUDED.image_caption,
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_motivation TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: delete_user_motivation (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.delete_user_motivation(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user making the request owns this user_id
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own motivation';
  END IF;

  DELETE FROM user_motivation WHERE user_id = p_user_id;
  RETURN TRUE;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_motivation TO authenticated, anon;

-- =====================================================
-- RPC FUNCTION: get_user_motivation (SECURITY DEFINER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_motivation(p_user_id UUID)
RETURNS user_motivation
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result user_motivation;
BEGIN
  -- Verify the user making the request owns this user_id
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only view your own motivation';
  END IF;

  SELECT * INTO result FROM user_motivation WHERE user_id = p_user_id;
  RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_motivation TO authenticated, anon;

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
