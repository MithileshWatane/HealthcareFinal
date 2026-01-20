-- Lifestyle Tracking Database Schema
-- Run this script in your Supabase SQL Editor to create all necessary tables

-- ============================================
-- SLEEP TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS lifestyle_sleep_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    bedtime TIME,
    wake_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON lifestyle_sleep_entries(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE lifestyle_sleep_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sleep entries"
    ON lifestyle_sleep_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
    ON lifestyle_sleep_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
    ON lifestyle_sleep_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
    ON lifestyle_sleep_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- ACTIVITY TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS lifestyle_activity_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER,
    exercise_duration_minutes INTEGER,
    activity_type TEXT,
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_activity_user_date ON lifestyle_activity_entries(user_id, date DESC);

ALTER TABLE lifestyle_activity_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity entries"
    ON lifestyle_activity_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity entries"
    ON lifestyle_activity_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity entries"
    ON lifestyle_activity_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity entries"
    ON lifestyle_activity_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- HYDRATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS lifestyle_hydration_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cups_consumed INTEGER NOT NULL,
    target_cups INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON lifestyle_hydration_entries(user_id, date DESC);

ALTER TABLE lifestyle_hydration_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hydration entries"
    ON lifestyle_hydration_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration entries"
    ON lifestyle_hydration_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration entries"
    ON lifestyle_hydration_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration entries"
    ON lifestyle_hydration_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- NUTRITION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS lifestyle_nutrition_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories INTEGER NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON lifestyle_nutrition_entries(user_id, date DESC);

ALTER TABLE lifestyle_nutrition_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition entries"
    ON lifestyle_nutrition_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition entries"
    ON lifestyle_nutrition_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition entries"
    ON lifestyle_nutrition_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition entries"
    ON lifestyle_nutrition_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- GOALS MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS lifestyle_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('sleep', 'exercise', 'hydration', 'nutrition')),
    title TEXT NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_active ON lifestyle_goals(user_id, is_active);

ALTER TABLE lifestyle_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
    ON lifestyle_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON lifestyle_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON lifestyle_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON lifestyle_goals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lifestyle_goals
CREATE TRIGGER update_lifestyle_goals_updated_at
    BEFORE UPDATE ON lifestyle_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment the following to insert sample data for testing
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

/*
-- Sample sleep data
INSERT INTO lifestyle_sleep_entries (user_id, date, duration_hours, quality_score)
VALUES 
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 7.5, 4),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '2 days', 6.8, 3),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '3 days', 8.0, 5);

-- Sample activity data
INSERT INTO lifestyle_activity_entries (user_id, date, steps, exercise_duration_minutes)
VALUES 
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 8500, 30),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '2 days', 6200, 0),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '3 days', 10200, 45);

-- Sample hydration data
INSERT INTO lifestyle_hydration_entries (user_id, date, cups_consumed, target_cups)
VALUES 
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 8, 10),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '2 days', 6, 10),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '3 days', 9, 10);

-- Sample nutrition data
INSERT INTO lifestyle_nutrition_entries (user_id, date, calories, meal_type, description)
VALUES 
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 500, 'breakfast', 'Oatmeal with fruits'),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 700, 'lunch', 'Chicken salad'),
    ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 800, 'dinner', 'Grilled fish with vegetables');

-- Sample goals
INSERT INTO lifestyle_goals (user_id, category, title, target_value, current_value, unit, is_active)
VALUES 
    ('YOUR_USER_ID', 'sleep', 'Sleep 8 hours daily', 8, 7.4, 'hours', true),
    ('YOUR_USER_ID', 'exercise', 'Walk 10,000 steps', 10000, 8500, 'steps', true),
    ('YOUR_USER_ID', 'hydration', 'Drink 10 cups of water', 10, 8, 'cups', true);
*/
