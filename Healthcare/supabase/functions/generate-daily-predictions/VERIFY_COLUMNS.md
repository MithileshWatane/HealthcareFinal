# Column Name Verification Guide

## Quick Verification

Run the SQL queries in `VERIFY_COLUMNS.sql` in your Supabase SQL Editor. This will show you all the actual column names in each table.

## What the Edge Function Expects

### Lifestyle Tables

**lifestyle_sleep_entries:**
- `user_id` - User identifier
- `date` - Entry date
- `duration_hours` - Sleep duration

**lifestyle_activity_entries:**
- `user_id` - User identifier
- `date` - Entry date
- `steps` - Daily step count

**lifestyle_hydration_entries:**
- `user_id` - User identifier
- `date` - Entry date
- `cups_consumed` - ✅ FIXED (was `cups`)

**lifestyle_nutrition_entries:**
- `user_id` - User identifier
- `date` - Entry date
- `calories` - Daily caloric intake

### Mental Health

**mental_health_scores:**
- `user_id`
- `mood_stability_index`
- `stress_resilience_score`
- `burnout_risk_score`
- `social_connection_index`
- `cognitive_fatigue_score`
- `overall_wellbeing_score`
- `calculated_at`

### Documents

**patient_documents:**
- `user_id`
- `category`
- `file_name`
- `uploaded_at`
- `description`

### Patients

**patients:**
- `id`
- `full_name`
- `dob`
- `gender`
- `blood_group`
- `height`
- `weight`
- `diseases`
- `allergies`
- `medications`
- `surgeries`
- `notes`
- `phone`
- `emergency_contact`

## How to Verify

1. **Run the SQL queries** in `VERIFY_COLUMNS.sql`
2. **Compare the results** with the expected columns above
3. **If any mismatch**, update the Edge Function code in `index.ts`

## Common Issues to Check

- ✅ `cups` vs `cups_consumed` (FIXED)
- Check if `duration_hours` might be `sleep_hours` or `hours`
- Check if `steps` might be `step_count` or `daily_steps`
- Check if `calories` might be `calorie_intake` or `daily_calories`

## Test with Sample Data

After verifying column names, test with a sample query:

```sql
-- Test hydration query (should return data)
SELECT user_id, date, cups_consumed
FROM lifestyle_hydration_entries
WHERE user_id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a'
AND date >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 5;

-- Test sleep query
SELECT user_id, date, duration_hours
FROM lifestyle_sleep_entries
WHERE user_id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a'
AND date >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 5;

-- Test activity query
SELECT user_id, date, steps
FROM lifestyle_activity_entries
WHERE user_id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a'
AND date >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 5;

-- Test nutrition query
SELECT user_id, date, calories
FROM lifestyle_nutrition_entries
WHERE user_id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a'
AND date >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 5;
```

If any of these queries return 0 results but you know data exists, the column name is wrong!

## If You Find Issues

1. Note the correct column name from the schema
2. Update `index.ts` in the Edge Function
3. Redeploy: `npx supabase functions deploy generate-daily-predictions`
4. Regenerate predictions by calling the function again
