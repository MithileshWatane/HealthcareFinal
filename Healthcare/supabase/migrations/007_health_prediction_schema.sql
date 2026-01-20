-- Health Prediction System Database Schema
-- Migration 007: Health Predictions, Test Recommendations, and Risk Assessments
-- Created: 2026-01-17

-- ============================================
-- HEALTH PREDICTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS health_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prediction_type TEXT NOT NULL, -- 'condition_risk', 'lifestyle_concern', 'mental_health_alert'
  condition_name TEXT NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  description TEXT NOT NULL,
  recommendations TEXT[],
  contributing_factors JSONB, -- stores factors that led to this prediction
  data_sources JSONB, -- which data was used (lifestyle, mental_health, medical_history)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_predictions_user 
ON health_predictions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_predictions_risk 
ON health_predictions(user_id, risk_level, is_active);

-- ============================================
-- MEDICAL TEST RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS medical_test_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_category TEXT NOT NULL, -- 'routine_screening', 'diagnostic', 'follow_up', 'preventive'
  priority_level TEXT NOT NULL CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  reason TEXT NOT NULL,
  recommended_frequency TEXT, -- 'annually', 'every_6_months', 'monthly', 'as_needed'
  age_based BOOLEAN DEFAULT false,
  condition_based BOOLEAN DEFAULT false,
  lifestyle_based BOOLEAN DEFAULT false,
  related_conditions TEXT[],
  estimated_cost_range TEXT,
  preparation_notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_recommendations_user 
ON medical_test_recommendations(user_id, priority_level, is_completed);

CREATE INDEX IF NOT EXISTS idx_test_recommendations_due 
ON medical_test_recommendations(user_id, next_due_date) WHERE is_completed = false;

-- ============================================
-- HEALTH RISK ASSESSMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS health_risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL, -- 'cardiovascular', 'diabetes', 'mental_health', 'sleep_disorder', 'nutritional'
  overall_risk_score DECIMAL(5,2) NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  risk_factors JSONB NOT NULL, -- detailed breakdown of contributing factors
  protective_factors JSONB, -- factors that reduce risk
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'declining', 'unknown')),
  previous_score DECIMAL(5,2),
  score_change DECIMAL(5,2), -- change from previous assessment
  recommendations TEXT[],
  lifestyle_modifications TEXT[],
  medical_interventions TEXT[],
  assessment_metadata JSONB, -- calculation details, data quality, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_user 
ON health_risk_assessments(user_id, assessment_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_level 
ON health_risk_assessments(user_id, risk_level);

-- ============================================
-- PREDICTION RULES TABLE (Configuration)
-- ============================================

CREATE TABLE IF NOT EXISTS prediction_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT UNIQUE NOT NULL,
  rule_type TEXT NOT NULL, -- 'age_based', 'condition_based', 'lifestyle_based', 'composite'
  target_prediction TEXT NOT NULL, -- what this rule predicts
  conditions JSONB NOT NULL, -- conditions that trigger this rule
  risk_score_calculation JSONB, -- how to calculate risk score
  recommendations TEXT[],
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediction_rules_active 
ON prediction_rules(is_active, priority DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_test_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_rules ENABLE ROW LEVEL SECURITY;

-- Health Predictions Policies
CREATE POLICY "Users can view their own health predictions"
ON health_predictions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health predictions"
ON health_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health predictions"
ON health_predictions FOR UPDATE USING (auth.uid() = user_id);

-- Medical Test Recommendations Policies
CREATE POLICY "Users can view their own test recommendations"
ON medical_test_recommendations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test recommendations"
ON medical_test_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test recommendations"
ON medical_test_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Health Risk Assessments Policies
CREATE POLICY "Users can view their own risk assessments"
ON health_risk_assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk assessments"
ON health_risk_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prediction Rules Policies (public read for active rules)
CREATE POLICY "Anyone can view active prediction rules"
ON prediction_rules FOR SELECT USING (is_active = true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate cardiovascular risk score
CREATE OR REPLACE FUNCTION calculate_cardiovascular_risk(
  p_user_id UUID,
  p_age INTEGER,
  p_bmi DECIMAL,
  p_has_hypertension BOOLEAN DEFAULT false,
  p_has_diabetes BOOLEAN DEFAULT false
)
RETURNS DECIMAL AS $$
DECLARE
  risk_score DECIMAL := 0;
  avg_sleep DECIMAL;
  avg_activity DECIMAL;
  stress_score DECIMAL;
BEGIN
  -- Age factor (increases with age)
  risk_score := risk_score + LEAST(40, (p_age - 30) * 0.8);
  
  -- BMI factor
  IF p_bmi > 30 THEN
    risk_score := risk_score + 25;
  ELSIF p_bmi > 25 THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Existing conditions
  IF p_has_hypertension THEN
    risk_score := risk_score + 20;
  END IF;
  
  IF p_has_diabetes THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Lifestyle factors
  SELECT AVG(duration_hours) INTO avg_sleep
  FROM lifestyle_sleep_entries
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  IF avg_sleep < 6 THEN
    risk_score := risk_score + 10;
  ELSIF avg_sleep < 7 THEN
    risk_score := risk_score + 5;
  END IF;
  
  -- Activity level
  SELECT AVG(steps) INTO avg_activity
  FROM lifestyle_activity_entries
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  IF COALESCE(avg_activity, 0) < 5000 THEN
    risk_score := risk_score + 15;
  ELSIF avg_activity < 7500 THEN
    risk_score := risk_score + 8;
  END IF;
  
  -- Mental health stress factor
  SELECT stress_resilience_score INTO stress_score
  FROM mental_health_scores
  WHERE user_id = p_user_id
  ORDER BY calculated_at DESC
  LIMIT 1;
  
  IF stress_score IS NOT NULL AND stress_score < 40 THEN
    risk_score := risk_score + 10;
  END IF;
  
  RETURN LEAST(100, GREATEST(0, risk_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate diabetes risk score
CREATE OR REPLACE FUNCTION calculate_diabetes_risk(
  p_user_id UUID,
  p_age INTEGER,
  p_bmi DECIMAL,
  p_has_family_history BOOLEAN DEFAULT false
)
RETURNS DECIMAL AS $$
DECLARE
  risk_score DECIMAL := 0;
  avg_calories DECIMAL;
  avg_activity DECIMAL;
BEGIN
  -- Age factor
  IF p_age > 45 THEN
    risk_score := risk_score + 20;
  ELSIF p_age > 35 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- BMI factor (strongest predictor)
  IF p_bmi > 30 THEN
    risk_score := risk_score + 35;
  ELSIF p_bmi > 25 THEN
    risk_score := risk_score + 20;
  END IF;
  
  -- Family history
  IF p_has_family_history THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Nutrition patterns
  SELECT AVG(calories) INTO avg_calories
  FROM lifestyle_nutrition_entries
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  IF avg_calories > 2500 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Physical activity
  SELECT AVG(steps) INTO avg_activity
  FROM lifestyle_activity_entries
  WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  IF COALESCE(avg_activity, 0) < 5000 THEN
    risk_score := risk_score + 15;
  END IF;
  
  RETURN LEAST(100, GREATEST(0, risk_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to determine risk level from score
CREATE OR REPLACE FUNCTION get_risk_level(p_score DECIMAL)
RETURNS TEXT AS $$
BEGIN
  IF p_score >= 75 THEN
    RETURN 'critical';
  ELSIF p_score >= 50 THEN
    RETURN 'high';
  ELSIF p_score >= 25 THEN
    RETURN 'moderate';
  ELSE
    RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_prediction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_health_predictions_timestamp
  BEFORE UPDATE ON health_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_timestamp();

CREATE TRIGGER update_test_recommendations_timestamp
  BEFORE UPDATE ON medical_test_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_timestamp();

CREATE TRIGGER update_prediction_rules_timestamp
  BEFORE UPDATE ON prediction_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_timestamp();

-- ============================================
-- SAMPLE PREDICTION RULES
-- ============================================

-- Age-based routine screenings
INSERT INTO prediction_rules (rule_name, rule_type, target_prediction, conditions, recommendations, priority)
VALUES 
  ('annual_physical_40plus', 'age_based', 'Annual Physical Examination', 
   '{"min_age": 40}', 
   ARRAY['Complete blood count (CBC)', 'Lipid panel', 'Blood pressure check', 'Blood glucose test'],
   10),
  
  ('colonoscopy_50plus', 'age_based', 'Colonoscopy Screening',
   '{"min_age": 50}',
   ARRAY['Schedule colonoscopy every 10 years', 'Discuss with gastroenterologist'],
   8),
  
  ('mammogram_40plus_female', 'age_based', 'Mammogram Screening',
   '{"min_age": 40, "gender": "female"}',
   ARRAY['Annual mammogram recommended', 'Consult with gynecologist'],
   9);

-- Lifestyle-based recommendations
INSERT INTO prediction_rules (rule_name, rule_type, target_prediction, conditions, recommendations, priority)
VALUES
  ('poor_sleep_quality', 'lifestyle_based', 'Sleep Study Recommendation',
   '{"avg_sleep_hours": {"max": 6}, "sleep_quality": {"max": 2}}',
   ARRAY['Consider sleep study', 'Evaluate for sleep apnea', 'Improve sleep hygiene'],
   7),
  
  ('low_activity_cardiovascular', 'lifestyle_based', 'Cardiovascular Assessment',
   '{"avg_steps": {"max": 5000}, "bmi": {"min": 25}}',
   ARRAY['Cardiac stress test', 'Lipid panel', 'Blood pressure monitoring', 'Increase physical activity'],
   8);

COMMENT ON TABLE health_predictions IS 'Stores AI-generated health predictions and risk assessments for users';
COMMENT ON TABLE medical_test_recommendations IS 'Stores recommended medical tests based on age, conditions, and lifestyle';
COMMENT ON TABLE health_risk_assessments IS 'Stores calculated risk scores for various health conditions';
COMMENT ON TABLE prediction_rules IS 'Configurable rules for generating health predictions and test recommendations';
