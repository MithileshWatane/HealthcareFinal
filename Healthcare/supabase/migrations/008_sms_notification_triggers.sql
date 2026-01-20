-- SMS Notification System - Database Triggers
-- Creates triggers to automatically send SMS when critical health alerts are detected

-- ============================================
-- TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION notify_critical_health_alert()
RETURNS TRIGGER AS $$
DECLARE
  should_notify BOOLEAN := FALSE;
BEGIN
  -- Check if this alert should trigger a notification
  IF TG_TABLE_NAME = 'health_predictions' THEN
    -- Notify for high or critical risk predictions
    should_notify := NEW.risk_level IN ('high', 'critical') AND NEW.is_active = TRUE;
  ELSIF TG_TABLE_NAME = 'medical_test_recommendations' THEN
    -- Notify for high or urgent priority tests
    should_notify := NEW.priority_level IN ('high', 'urgent') AND NEW.is_completed = FALSE;
  END IF;

  -- If notification criteria met, call Edge Function
  IF should_notify THEN
    PERFORM net.http_post(
      url := 'https://edwuptavjdakjuqyrxaf.supabase.co/functions/v1/send-health-alert-sms',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd3VwdGF2amRha2p1cXlyeGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzOTU1MSwiZXhwIjoyMDgzODE1NTUxfQ.aTofp-GOE2re7eZaGDhMFRoCbU0LcvNg-x0-Khg57Qo'  -- Replace with actual key
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'alert_type', TG_TABLE_NAME,
        'data', row_to_json(NEW)
      )
    );
    
    RAISE NOTICE 'SMS notification triggered for user % - % alert', NEW.user_id, TG_TABLE_NAME;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS health_prediction_alert_trigger ON health_predictions;
DROP TRIGGER IF EXISTS test_recommendation_alert_trigger ON medical_test_recommendations;

-- Trigger for health_predictions table
CREATE TRIGGER health_prediction_alert_trigger
AFTER INSERT ON health_predictions
FOR EACH ROW
EXECUTE FUNCTION notify_critical_health_alert();

-- Trigger for medical_test_recommendations table
CREATE TRIGGER test_recommendation_alert_trigger
AFTER INSERT ON medical_test_recommendations
FOR EACH ROW
EXECUTE FUNCTION notify_critical_health_alert();

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that triggers were created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('health_prediction_alert_trigger', 'test_recommendation_alert_trigger');

COMMENT ON FUNCTION notify_critical_health_alert() IS 'Sends SMS notification when critical health predictions or urgent medical tests are detected';
