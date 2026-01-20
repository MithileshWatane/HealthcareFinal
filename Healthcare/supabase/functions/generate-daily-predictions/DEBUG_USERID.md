# Quick SQL Check - User ID Mismatch

Run this in Supabase SQL Editor to understand the relationship:

```sql
-- Check the patients table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients';

-- Check if there's a user_id column in patients
SELECT id, user_id, full_name 
FROM patients 
WHERE id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a';

-- Check what user_ids are in health_predictions
SELECT DISTINCT user_id 
FROM health_predictions 
WHERE is_active = true;

-- Try to find the correct mapping
SELECT p.id as patient_id, p.user_id, p.full_name,
       COUNT(hp.id) as prediction_count
FROM patients p
LEFT JOIN health_predictions hp ON hp.user_id = p.id
WHERE p.id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a'
GROUP BY p.id, p.user_id, p.full_name;
```

This will help us understand:
1. Does `patients` table have a `user_id` column?
2. What's the relationship between `patients.id` and `health_predictions.user_id`?
3. Are predictions being stored with the wrong user_id?
