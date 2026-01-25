-- Shift Ascent Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  integrity_score INTEGER DEFAULT 50 CHECK (integrity_score >= 0 AND integrity_score <= 100),
  status TEXT DEFAULT 'Inconsistent' CHECK (status IN ('Reliable', 'Inconsistent', 'Unreliable')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICING PLANS TABLE (Admin Controlled)
-- =====================================================
CREATE TABLE pricing_plans (
  id TEXT PRIMARY KEY, -- 'pledge', 'keeper', 'unbreakable'
  name TEXT NOT NULL,
  tagline TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0,  -- in cents
  discount_percent INTEGER DEFAULT 0,

  -- Limits
  max_active_goals INTEGER DEFAULT 1, -- NULL = unlimited
  max_milestones_per_goal INTEGER, -- NULL = unlimited
  max_shares_per_month INTEGER DEFAULT 5, -- NULL = unlimited

  -- Features (JSON for flexibility)
  features JSONB DEFAULT '{}'::jsonb,

  -- Display
  is_featured BOOLEAN DEFAULT FALSE,
  badge_text TEXT,
  cta_text TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO pricing_plans (id, name, tagline, price_monthly, price_yearly, discount_percent, max_active_goals, max_milestones_per_goal, max_shares_per_month, is_featured, badge_text, cta_text, sort_order, features)
VALUES
  ('pledge', 'Pledge', 'Make your first promise', 0, 0, 0, 1, NULL, 5, FALSE, NULL, 'Make Your Pledge', 1,
   '{"basicIntegrity": true, "publicShareLinks": true, "communityWitnessing": true, "advancedAnalytics": false, "customConsequences": false, "exportJourney": false, "apiAccess": false}'::jsonb),

  ('keeper', 'Keeper', 'Honor every promise', 900, 7900, 27, NULL, NULL, NULL, TRUE, 'Most Popular', 'Become a Keeper', 2,
   '{"basicIntegrity": true, "publicShareLinks": true, "communityWitnessing": true, "advancedAnalytics": true, "customConsequences": true, "priorityWitness": true, "exportJourney": true, "apiAccess": false}'::jsonb),

  ('unbreakable', 'Unbreakable', 'Your word is absolute', 1900, 16600, 27, NULL, NULL, NULL, FALSE, 'Best Value', 'Go Unbreakable', 3,
   '{"basicIntegrity": true, "publicShareLinks": true, "communityWitnessing": true, "advancedAnalytics": true, "customConsequences": true, "priorityWitness": true, "exportJourney": true, "apiAccess": true, "prioritySupport": true, "earlyAccess": true, "customBadges": true}'::jsonb);

-- =====================================================
-- USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES pricing_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Stripe integration (for future)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  -- Dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Usage tracking
  shares_used_this_month INTEGER DEFAULT 0,
  shares_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One active subscription per user
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON user_subscriptions(plan_id);

-- =====================================================
-- GOALS TABLE
-- =====================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  reflection TEXT,
  final_integrity_score INTEGER,
  stats JSONB DEFAULT '{"totalMilestones": 0, "completedMilestones": 0, "brokenPromises": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user goal lookups
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

-- =====================================================
-- MILESTONES TABLE
-- =====================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'locked', 'completed', 'broken')),

  -- Promise details (embedded as columns for easier querying)
  promise_text TEXT,
  promise_deadline TIMESTAMP WITH TIME ZONE,
  promise_consequence TEXT,
  promise_locked_at TIMESTAMP WITH TIME ZONE,
  witness_count INTEGER DEFAULT 0,

  -- Completion/failure tracking
  completed_at TIMESTAMP WITH TIME ZONE,
  broken_at TIMESTAMP WITH TIME ZONE,
  break_reason TEXT,
  auto_expired BOOLEAN DEFAULT FALSE,

  -- Reflection (stored as JSONB for flexibility)
  reflection JSONB,

  -- Consequence proof
  consequence_proof JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique milestone numbers per goal
  UNIQUE(goal_id, number)
);

-- Indexes for faster lookups
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- =====================================================
-- FAILURE HISTORY TABLE
-- Tracks all broken promises for permanent record
-- =====================================================
CREATE TABLE failure_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  milestone_title TEXT NOT NULL,
  goal_title TEXT NOT NULL,
  status TEXT DEFAULT 'broken',
  break_reason TEXT,
  reflection JSONB,
  broken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_expired BOOLEAN DEFAULT FALSE,
  consequence_proof JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user failure history
CREATE INDEX idx_failure_history_user_id ON failure_history(user_id);

-- =====================================================
-- CALENDAR DATA TABLE
-- Tracks daily work/check-ins
-- =====================================================
CREATE TABLE calendar_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  worked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One entry per user per day
  UNIQUE(user_id, date)
);

-- Index for date lookups
CREATE INDEX idx_calendar_user_date ON calendar_data(user_id, date);

-- =====================================================
-- WITNESSES TABLE
-- Tracks who witnessed a commitment
-- =====================================================
CREATE TABLE witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  witness_identifier TEXT NOT NULL, -- Could be session ID or user ID
  witnessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate witnesses
  UNIQUE(milestone_id, witness_identifier)
);

CREATE INDEX idx_witnesses_milestone_id ON witnesses(milestone_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" ON milestones
  FOR DELETE USING (auth.uid() = user_id);

-- Public milestone view for witnesses (shareable page)
CREATE POLICY "Anyone can view locked milestones for witnessing" ON milestones
  FOR SELECT USING (status = 'locked');

-- Failure history policies
CREATE POLICY "Users can view own failure history" ON failure_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own failure history" ON failure_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Calendar data policies
CREATE POLICY "Users can view own calendar data" ON calendar_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar data" ON calendar_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar data" ON calendar_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Witnesses policies (anyone can witness)
CREATE POLICY "Anyone can view witnesses" ON witnesses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can add witness" ON witnesses
  FOR INSERT WITH CHECK (true);

-- Pricing plans policies (public read, admin only write)
CREATE POLICY "Anyone can view pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription usage" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_data_updated_at
  BEFORE UPDATE ON calendar_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user status based on integrity score
CREATE OR REPLACE FUNCTION calculate_user_status(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 70 THEN
    RETURN 'Reliable';
  ELSIF score >= 40 THEN
    RETURN 'Inconsistent';
  ELSE
    RETURN 'Unreliable';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update integrity score and status
CREATE OR REPLACE FUNCTION update_integrity_score(
  p_user_id UUID,
  p_change INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_score INTEGER;
  new_status TEXT;
BEGIN
  -- Calculate new score (clamped between 0 and 100)
  UPDATE users
  SET integrity_score = GREATEST(0, LEAST(100, integrity_score + p_change))
  WHERE id = p_user_id
  RETURNING integrity_score INTO new_score;

  -- Update status based on new score
  new_status := calculate_user_status(new_score);

  UPDATE users
  SET status = new_status
  WHERE id = p_user_id;

  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update witness count
CREATE OR REPLACE FUNCTION increment_witness_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE milestones
  SET witness_count = witness_count + 1
  WHERE id = NEW.milestone_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_witness_count
  AFTER INSERT ON witnesses
  FOR EACH ROW EXECUTE FUNCTION increment_witness_count();

-- Function to update goal stats when milestone changes
CREATE OR REPLACE FUNCTION update_goal_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals
  SET stats = (
    SELECT jsonb_build_object(
      'totalMilestones', COUNT(*),
      'completedMilestones', COUNT(*) FILTER (WHERE status = 'completed'),
      'brokenPromises', COUNT(*) FILTER (WHERE status = 'broken')
    )
    FROM milestones
    WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
  )
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_stats_on_milestone_change
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_goal_stats();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for current locked milestone (for sharing)
CREATE VIEW public_locked_milestones AS
SELECT
  m.id,
  m.title,
  m.status,
  m.promise_text,
  m.promise_deadline,
  m.promise_locked_at,
  m.witness_count,
  u.full_name as user_name,
  u.integrity_score,
  u.status as user_status
FROM milestones m
JOIN users u ON m.user_id = u.id
WHERE m.status = 'locked';
