-- =====================================================
-- ADMIN CONTENT MANAGEMENT TABLES
-- Migration: 010_admin_content_tables.sql
-- =====================================================

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  quote TEXT NOT NULL,
  highlight TEXT, -- Key phrase to highlight in quote
  kept_promises INTEGER DEFAULT 0,
  broken_promises INTEGER DEFAULT 0,
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FAQS TABLE
-- =====================================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- general, pricing, features, account
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MOTIVATIONAL QUOTES TABLE (for dashboard)
-- =====================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'motivation', -- motivation, integrity, success, perseverance
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OFFERS/PROMOTIONS TABLE (for landing page)
-- =====================================================
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  badge_text TEXT, -- e.g., "Limited Time", "New"
  discount_percent INTEGER,
  discount_code TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  cta_link TEXT DEFAULT '/login',
  bg_color TEXT DEFAULT 'gold', -- gold, blue, green, purple
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SITE STATISTICS TABLE (for landing page)
-- =====================================================
CREATE TABLE site_stats (
  id TEXT PRIMARY KEY DEFAULT 'main', -- Only one row needed
  promises_kept INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  avg_integrity_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site stats
INSERT INTO site_stats (id, promises_kept, success_rate, active_users, avg_integrity_score)
VALUES ('main', 2847, 89, 1203, 73);

-- =====================================================
-- SEED DATA: TESTIMONIALS
-- =====================================================
INSERT INTO testimonials (name, initials, role, score, quote, highlight, kept_promises, broken_promises, is_featured, sort_order)
VALUES
  ('Alex Chen', 'AC', 'Software Engineer', 92, 
   'I went from inconsistent gym habits to a 92 integrity score—now I trust myself like never before. 6 months ago I couldn''t stick to anything. Today, I''ve completed 47 milestones.',
   'gym habits', 47, 3, TRUE, 1),
  
  ('Jordan Williams', 'JW', 'Startup Founder', 78,
   'Breaking promises used to crush me; now confessions turn them into lessons. This app reignited my self-belief. Launched my MVP on time for the first time ever.',
   'self-belief', 28, 8, TRUE, 2),
  
  ('Maya Rodriguez', 'MR', 'Marketing Manager', 85,
   'Finally, a system that holds me accountable without judgment. My career goals are actually happening now. Got promoted twice since I started.',
   'career goals', 34, 5, TRUE, 3),
  
  ('David Kim', 'DK', 'Graduate Student', 88,
   'Procrastination was killing my thesis progress. Shift Ascent helped me break it into locked promises. Defended my thesis 2 weeks early.',
   'thesis progress', 52, 6, FALSE, 4),
  
  ('Sarah Mitchell', 'SM', 'Fitness Coach', 95,
   'As someone who helps others stay accountable, I needed this for myself. My personal goals finally get the same attention as my clients''.',
   'personal goals', 67, 2, FALSE, 5);

-- =====================================================
-- SEED DATA: FAQS
-- =====================================================
INSERT INTO faqs (question, answer, category, sort_order)
VALUES
  ('How does facing my confessions build unshakable confidence?',
   'When you admit a broken promise, you''re choosing honesty over hiding. This simple act of self-accountability rewires your brain to trust your own words again. Each confession is a stepping stone, not a stumbling block—proof that you''re committed to growth, even when it''s hard.',
   'general', 1),
  
  ('What if I keep breaking promises? Will my score ever recover?',
   'Absolutely. Your integrity score reflects your journey, not your past mistakes. Every kept promise adds +2 points, and consistency rebuilds momentum. Many users have climbed from ''Unreliable'' to ''Reliable'' in weeks. The key is starting small and staying honest.',
   'general', 2),
  
  ('Is this app about punishment or motivation?',
   'Neither—it''s about truth. We don''t punish you; we help you see yourself clearly. The point deductions for broken promises aren''t penalties; they''re honest reflections. And the pride you feel when your score rises? That''s your authentic self-trust growing.',
   'general', 3),
  
  ('Can I use Shift Ascent for any type of goal?',
   'Yes! Whether it''s fitness, career milestones, learning a new skill, building relationships, or breaking bad habits—if you can promise it, you can track it. The system adapts to your life, not the other way around.',
   'features', 4),
  
  ('What happens when I complete all my milestones?',
   'Congratulations! You''ll be able to reflect on your journey, see your integrity growth, and set a new goal. Your integrity score carries forward, building a lifetime track record of kept promises.',
   'features', 5),
  
  ('Can others see my broken promises?',
   'Only if you share them. Your journey is private by default. You control what gets shared via public witness links. Many users find that public accountability helps, but it''s always your choice.',
   'account', 6);

-- =====================================================
-- SEED DATA: QUOTES
-- =====================================================
INSERT INTO quotes (text, author, category)
VALUES
  ('The promises you make to yourself are the most important ones to keep.', 'Unknown', 'integrity'),
  ('Your word is your bond. Your integrity is your legacy.', 'Unknown', 'integrity'),
  ('Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', 'John C. Maxwell', 'perseverance'),
  ('Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier', 'success'),
  ('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', 'motivation'),
  ('Integrity is doing the right thing, even when no one is watching.', 'C.S. Lewis', 'integrity'),
  ('A promise is a cloud; fulfillment is rain.', 'Arabian Proverb', 'integrity'),
  ('The distance between your dreams and reality is called discipline.', 'Unknown', 'motivation'),
  ('Every promise kept strengthens the next one.', 'Shift Ascent', 'integrity'),
  ('Trust yourself. You''ve survived a lot, and you''ll survive whatever is coming.', 'Robert Tew', 'perseverance');

-- =====================================================
-- SEED DATA: DEFAULT OFFER
-- =====================================================
INSERT INTO offers (title, description, badge_text, discount_percent, cta_text, cta_link, bg_color, is_active, sort_order)
VALUES
  ('Start Your Journey Free', 'Track your first goal with zero commitment. Upgrade when you''re ready to go unlimited.', 
   'No Credit Card', NULL, 'Get Started Free', '/login', 'gold', TRUE, 1);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for all content tables
CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "Public can view active faqs" ON faqs
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "Public can view active quotes" ON quotes
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "Public can view active offers" ON offers
  FOR SELECT TO anon, authenticated 
  USING (is_active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()));

CREATE POLICY "Public can view site stats" ON site_stats
  FOR SELECT TO anon, authenticated USING (TRUE);

-- Admin full access (authenticated users for now, add role check in production)
CREATE POLICY "Admin full access testimonials" ON testimonials
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access faqs" ON faqs
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access quotes" ON quotes
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access offers" ON offers
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access site_stats" ON site_stats
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_testimonials_active ON testimonials(is_active, sort_order);
CREATE INDEX idx_faqs_active ON faqs(is_active, category, sort_order);
CREATE INDEX idx_quotes_active ON quotes(is_active, category);
CREATE INDEX idx_offers_active ON offers(is_active, starts_at, ends_at);
