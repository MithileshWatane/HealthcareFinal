-- Mental Health Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. MOOD ENTRIES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  mood_label TEXT,
  journal_entry TEXT,
  tags TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created 
ON mood_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_value 
ON mood_entries(user_id, mood_value);

-- ============================================
-- 2. WELLNESS ACTIVITIES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS wellness_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_subtype TEXT,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_wellness_activities_user 
ON wellness_activities(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_wellness_activities_type 
ON wellness_activities(user_id, activity_type);

-- ============================================
-- 3. MENTAL HEALTH GAMES TABLE (New)
-- ============================================
CREATE TABLE IF NOT EXISTS mental_health_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER,
  duration INTEGER,
  difficulty TEXT,
  metadata JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_games_user_type 
ON mental_health_games(user_id, game_type, completed_at DESC);

-- ============================================
-- 4. MOOD PATTERNS TABLE (New)
-- ============================================
CREATE TABLE IF NOT EXISTS mood_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB,
  confidence_score DECIMAL(3,2),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_patterns_user 
ON mood_patterns(user_id, detected_at DESC);

-- ============================================
-- 5. MENTAL HEALTH INSIGHTS TABLE (New)
-- ============================================
CREATE TABLE IF NOT EXISTS mental_health_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  recommendations TEXT[],
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_insights_user_unacknowledged 
ON mental_health_insights(user_id, acknowledged, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_insights ENABLE ROW LEVEL SECURITY;

-- Mood Entries Policies
CREATE POLICY "Users can view their own mood entries"
ON mood_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
ON mood_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
ON mood_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
ON mood_entries FOR DELETE
USING (auth.uid() = user_id);

-- Wellness Activities Policies
CREATE POLICY "Users can view their own wellness activities"
ON wellness_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness activities"
ON wellness_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness activities"
ON wellness_activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness activities"
ON wellness_activities FOR DELETE
USING (auth.uid() = user_id);

-- Mental Health Games Policies
CREATE POLICY "Users can view their own game records"
ON mental_health_games FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game records"
ON mental_health_games FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Mood Patterns Policies
CREATE POLICY "Users can view their own mood patterns"
ON mood_patterns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert mood patterns"
ON mood_patterns FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Mental Health Insights Policies
CREATE POLICY "Users can view their own insights"
ON mental_health_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON mental_health_insights FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
ON mental_health_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================

-- Function to calculate mental health score
CREATE OR REPLACE FUNCTION calculate_mental_health_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_mood DECIMAL;
  activity_count INTEGER;
  score INTEGER;
BEGIN
  -- Get average mood from last 30 days
  SELECT AVG(mood_value) INTO avg_mood
  FROM mood_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Get wellness activity count from last 30 days
  SELECT COUNT(*) INTO activity_count
  FROM wellness_activities
  WHERE user_id = p_user_id
    AND completed_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate score (0-100)
  score := LEAST(100, GREATEST(0, 
    (COALESCE(avg_mood, 3) / 5.0 * 60)::INTEGER + 
    (LEAST(activity_count, 20) * 2)
  ));
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mood trend
CREATE OR REPLACE FUNCTION get_mood_trend(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  day_date DATE,
  avg_mood DECIMAL,
  entry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as day_date,
    AVG(mood_value) as avg_mood,
    COUNT(*)::INTEGER as entry_count
  FROM mood_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY day_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mood_entries_updated_at
BEFORE UPDATE ON mood_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- You can add sample affirmations or other reference data here if needed
