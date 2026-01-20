-- Comprehensive Mental Health Data Collection Schema
-- Migration 002: Advanced Mental Health Tracking System

-- ============================================
-- GAME-BASED ACTIVITIES TABLES
-- ============================================

-- 1. Emotion Recognition Game Data
CREATE TABLE IF NOT EXISTS emotion_recognition_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT uuid_generate_v4(),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  accuracy_rate DECIMAL(5,2),
  average_reaction_time INTEGER, -- milliseconds
  negative_emotion_bias DECIMAL(5,2), -- percentage of negative emotions selected
  confusion_matrix JSONB, -- stores emotion confusion patterns
  emotion_breakdown JSONB, -- accuracy per emotion type
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotion_recognition_user 
ON emotion_recognition_data(user_id, completed_at DESC);

-- 2. Attention & Focus Game Data
CREATE TABLE IF NOT EXISTS attention_focus_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT uuid_generate_v4(),
  game_type TEXT NOT NULL, -- 'number_sequence', 'stroop', 'mixed'
  total_tasks INTEGER NOT NULL,
  errors INTEGER NOT NULL,
  impulsive_errors INTEGER, -- quick wrong answers
  average_response_time INTEGER, -- milliseconds
  task_abandonment_count INTEGER,
  fatigue_curve JSONB, -- performance over time
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attention_focus_user 
ON attention_focus_data(user_id, completed_at DESC);

-- 3. Stress Response Game Data
CREATE TABLE IF NOT EXISTS stress_response_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT uuid_generate_v4(),
  difficulty_level TEXT NOT NULL,
  performance_score INTEGER,
  error_spikes JSONB, -- when errors occurred during pressure
  stress_tolerance_score DECIMAL(5,2),
  recovery_time INTEGER, -- time to stabilize after pressure
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stress_response_user 
ON stress_response_data(user_id, completed_at DESC);

-- 4. Decision Making Game Data
CREATE TABLE IF NOT EXISTS decision_making_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT uuid_generate_v4(),
  total_decisions INTEGER NOT NULL,
  risky_choices INTEGER,
  safe_choices INTEGER,
  risk_preference_score DECIMAL(5,2), -- -100 to 100
  regret_behavior JSONB, -- pattern of changing decisions
  decision_consistency DECIMAL(5,2),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_making_user 
ON decision_making_data(user_id, completed_at DESC);

-- ============================================
-- DAILY CHECK-IN FORMS TABLES
-- ============================================

-- 5. Daily Mood Slider Entries
CREATE TABLE IF NOT EXISTS daily_mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 100),
  mood_emoji TEXT,
  daily_variance DECIMAL(5,2), -- calculated from previous entries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_mood_user 
ON daily_mood_entries(user_id, created_at DESC);

-- 6. Energy & Motivation Entries
CREATE TABLE IF NOT EXISTS energy_motivation_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  motivation_level INTEGER NOT NULL CHECK (motivation_level >= 1 AND motivation_level <= 5),
  feeling_drained BOOLEAN,
  felt_motivated_today BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_energy_motivation_user 
ON energy_motivation_entries(user_id, created_at DESC);

-- 7. Thought Pattern Reflections
CREATE TABLE IF NOT EXISTS thought_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thought_text TEXT NOT NULL,
  sentiment_score DECIMAL(5,2), -- -1 to 1
  cognitive_distortions JSONB, -- AI-detected patterns
  emotion_tags TEXT[],
  is_rumination BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thought_patterns_user 
ON thought_patterns(user_id, created_at DESC);

-- 8. Social Interaction Check-ins
CREATE TABLE IF NOT EXISTS social_interaction_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  talked_to_someone BOOLEAN NOT NULL,
  felt_connected BOOLEAN,
  connection_quality INTEGER CHECK (connection_quality >= 1 AND connection_quality <= 5),
  social_energy TEXT, -- 'energized', 'neutral', 'drained'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_interaction_user 
ON social_interaction_entries(user_id, created_at DESC);

-- ============================================
-- GUIDED ACTIVITIES TABLES
-- ============================================

-- 9. Breathing Exercise Sessions
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_duration INTEGER NOT NULL, -- seconds
  target_duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  drop_off_time INTEGER, -- when user stopped if incomplete
  completion_rate DECIMAL(5,2),
  stress_before INTEGER CHECK (stress_before >= 1 AND stress_before <= 10),
  stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
  recovery_speed DECIMAL(5,2), -- stress reduction rate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user 
ON breathing_sessions(user_id, created_at DESC);

-- 10. Journal Entries (AI-Prompted)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT NOT NULL,
  entry_text TEXT NOT NULL,
  word_count INTEGER,
  sentiment_score DECIMAL(5,2),
  emotion_frequency JSONB, -- frequency of different emotions
  rumination_detected BOOLEAN DEFAULT false,
  key_themes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user 
ON journal_entries(user_id, created_at DESC);

-- 11. Sleep Reflections
CREATE TABLE IF NOT EXISTS sleep_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  hours_slept DECIMAL(3,1),
  wake_up_count INTEGER,
  had_dreams BOOLEAN,
  dream_description TEXT,
  dream_sentiment DECIMAL(5,2),
  sleep_issues TEXT[], -- 'insomnia', 'nightmares', 'restless', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sleep_reflections_user 
ON sleep_reflections(user_id, created_at DESC);

-- ============================================
-- PASSIVE BEHAVIORAL SIGNALS TABLE
-- ============================================

-- 12. Behavioral Signals
CREATE TABLE IF NOT EXISTS behavioral_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_duration INTEGER, -- seconds
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  features_used TEXT[],
  interaction_count INTEGER,
  typing_speed INTEGER, -- words per minute
  typing_deletions INTEGER,
  typing_pauses INTEGER,
  page_switches INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavioral_signals_user 
ON behavioral_signals(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_behavioral_signals_time 
ON behavioral_signals(user_id, time_of_day, created_at DESC);

-- ============================================
-- MENTAL HEALTH COMPOSITE SCORES TABLE
-- ============================================

-- 13. Mental Health Scores (Computed Indexes)
CREATE TABLE IF NOT EXISTS mental_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_stability_index DECIMAL(5,2), -- 0-100
  stress_resilience_score DECIMAL(5,2), -- 0-100
  burnout_risk_score DECIMAL(5,2), -- 0-100
  social_connection_index DECIMAL(5,2), -- 0-100
  cognitive_fatigue_score DECIMAL(5,2), -- 0-100
  overall_wellbeing_score DECIMAL(5,2), -- 0-100
  calculation_metadata JSONB, -- stores how scores were calculated
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mental_health_scores_user 
ON mental_health_scores(user_id, calculated_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE emotion_recognition_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_focus_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_response_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_making_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_motivation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interaction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (same pattern for each)
-- Emotion Recognition Data
CREATE POLICY "Users can view their own emotion recognition data"
ON emotion_recognition_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotion recognition data"
ON emotion_recognition_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attention Focus Data
CREATE POLICY "Users can view their own attention focus data"
ON attention_focus_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attention focus data"
ON attention_focus_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stress Response Data
CREATE POLICY "Users can view their own stress response data"
ON stress_response_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stress response data"
ON stress_response_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Decision Making Data
CREATE POLICY "Users can view their own decision making data"
ON decision_making_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decision making data"
ON decision_making_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Mood Entries
CREATE POLICY "Users can view their own daily mood entries"
ON daily_mood_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily mood entries"
ON daily_mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Energy Motivation Entries
CREATE POLICY "Users can view their own energy motivation entries"
ON energy_motivation_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy motivation entries"
ON energy_motivation_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Thought Patterns
CREATE POLICY "Users can view their own thought patterns"
ON thought_patterns FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thought patterns"
ON thought_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social Interaction Entries
CREATE POLICY "Users can view their own social interaction entries"
ON social_interaction_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social interaction entries"
ON social_interaction_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Breathing Sessions
CREATE POLICY "Users can view their own breathing sessions"
ON breathing_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own breathing sessions"
ON breathing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal Entries
CREATE POLICY "Users can view their own journal entries"
ON journal_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON journal_entries FOR UPDATE USING (auth.uid() = user_id);

-- Sleep Reflections
CREATE POLICY "Users can view their own sleep reflections"
ON sleep_reflections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep reflections"
ON sleep_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Behavioral Signals
CREATE POLICY "Users can view their own behavioral signals"
ON behavioral_signals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavioral signals"
ON behavioral_signals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mental Health Scores
CREATE POLICY "Users can view their own mental health scores"
ON mental_health_scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mental health scores"
ON mental_health_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate mood stability index
CREATE OR REPLACE FUNCTION calculate_mood_stability_index(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  mood_variance DECIMAL;
  stability_index DECIMAL;
BEGIN
  SELECT VARIANCE(mood_score) INTO mood_variance
  FROM daily_mood_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Lower variance = higher stability (invert and normalize to 0-100)
  stability_index := LEAST(100, GREATEST(0, 100 - (COALESCE(mood_variance, 0) / 10)));
  
  RETURN stability_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate stress resilience score
CREATE OR REPLACE FUNCTION calculate_stress_resilience_score(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  avg_tolerance DECIMAL;
  avg_recovery DECIMAL;
  resilience_score DECIMAL;
BEGIN
  SELECT 
    AVG(stress_tolerance_score),
    AVG(recovery_time)
  INTO avg_tolerance, avg_recovery
  FROM stress_response_data
  WHERE user_id = p_user_id
    AND completed_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Combine tolerance and recovery (lower recovery time is better)
  resilience_score := LEAST(100, GREATEST(0, 
    (COALESCE(avg_tolerance, 50) * 0.7) + 
    ((100 - LEAST(100, COALESCE(avg_recovery, 50))) * 0.3)
  ));
  
  RETURN resilience_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate burnout risk score
CREATE OR REPLACE FUNCTION calculate_burnout_risk_score(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  avg_energy DECIMAL;
  avg_motivation DECIMAL;
  fatigue_trend DECIMAL;
  burnout_risk DECIMAL;
BEGIN
  SELECT 
    AVG(energy_level),
    AVG(motivation_level)
  INTO avg_energy, avg_motivation
  FROM energy_motivation_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Get cognitive fatigue from attention games
  SELECT AVG(errors::DECIMAL / NULLIF(total_tasks, 0) * 100) INTO fatigue_trend
  FROM attention_focus_data
  WHERE user_id = p_user_id
    AND completed_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Higher risk with low energy, low motivation, high fatigue
  burnout_risk := LEAST(100, GREATEST(0,
    ((5 - COALESCE(avg_energy, 3)) * 20) +
    ((5 - COALESCE(avg_motivation, 3)) * 20) +
    (COALESCE(fatigue_trend, 0) * 0.6)
  ));
  
  RETURN burnout_risk;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate social connection index
CREATE OR REPLACE FUNCTION calculate_social_connection_index(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  interaction_rate DECIMAL;
  v_connection_quality DECIMAL;
  social_index DECIMAL;
BEGIN
  SELECT 
    (COUNT(CASE WHEN talked_to_someone THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    AVG(connection_quality) * 20
  INTO interaction_rate, v_connection_quality
  FROM social_interaction_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  social_index := LEAST(100, GREATEST(0,
    (COALESCE(interaction_rate, 0) * 0.4) +
    (COALESCE(v_connection_quality, 0) * 0.6)
  ));
  
  RETURN social_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate cognitive fatigue score
CREATE OR REPLACE FUNCTION calculate_cognitive_fatigue_score(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  avg_errors DECIMAL;
  avg_response_time DECIMAL;
  fatigue_score DECIMAL;
BEGIN
  SELECT 
    AVG(errors::DECIMAL / NULLIF(total_tasks, 0) * 100),
    AVG(average_response_time)
  INTO avg_errors, avg_response_time
  FROM attention_focus_data
  WHERE user_id = p_user_id
    AND completed_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Higher errors and slower response = higher fatigue
  fatigue_score := LEAST(100, GREATEST(0,
    (COALESCE(avg_errors, 0) * 0.6) +
    (LEAST(100, COALESCE(avg_response_time, 0) / 50) * 0.4)
  ));
  
  RETURN fatigue_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
