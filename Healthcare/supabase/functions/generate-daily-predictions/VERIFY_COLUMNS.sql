-- Verify Column Names for Edge Function
-- Run this in Supabase SQL Editor to verify all column names match

-- 1. Check lifestyle_sleep_entries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lifestyle_sleep_entries'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - date
-- - duration_hours ✓

-- 2. Check lifestyle_activity_entries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lifestyle_activity_entries'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - date
-- - steps ✓

-- 3. Check lifestyle_hydration_entries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lifestyle_hydration_entries'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - date
-- - cups_consumed ✓ (FIXED)

-- 4. Check lifestyle_nutrition_entries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lifestyle_nutrition_entries'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - date
-- - calories ✓

-- 5. Check mental_health_scores
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mental_health_scores'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - mood_stability_index
-- - stress_resilience_score
-- - burnout_risk_score
-- - social_connection_index
-- - cognitive_fatigue_score
-- - overall_wellbeing_score
-- - calculated_at

-- 6. Check patient_documents
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_documents'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - user_id
-- - category
-- - file_name
-- - uploaded_at
-- - description

-- 7. Check patients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- Expected columns used in Edge Function:
-- - id
-- - full_name
-- - dob
-- - gender
-- - blood_group
-- - height
-- - weight
-- - diseases
-- - allergies
-- - medications
-- - surgeries
-- - notes
-- - phone
-- - emergency_contact
