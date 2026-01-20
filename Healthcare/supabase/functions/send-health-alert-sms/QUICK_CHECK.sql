-- Quick Verification - Run this in Supabase SQL Editor

-- 1. Enable pg_net (required for triggers to make HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Check if trigger exists
SELECT 
  trigger_name, 
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'health_prediction_alert_trigger';

-- 3. Check patient phone number
SELECT id, full_name, phone
FROM patients
WHERE id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a';

-- If the above returns results, the issue is likely:
-- A) Trigger not created - Run 008_sms_notification_triggers.sql
-- B) Edge Function not deployed - Run: npx supabase functions deploy send-health-alert-sms
-- C) Service role key not set in trigger - Edit 008_sms_notification_triggers.sql
