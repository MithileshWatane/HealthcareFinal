# SMS Notification Debugging Checklist


Run these queries in Supabase SQL Editor to debug:

## 1. Check if Trigger Exists

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'health_prediction_alert_trigger';
```

**Expected:** Should return 1 row showing the trigger exists

---

## 2. Check if pg_net Extension is Enabled

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

**Expected:** Should return 1 row
**If empty:** Run `CREATE EXTENSION IF NOT EXISTS pg_net;`

---

## 3. Check if the Prediction Was Inserted

```sql
SELECT id, user_id, condition_name, risk_level, created_at
FROM health_predictions
WHERE condition_name = 'Test Critical Alert'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** Should show your test prediction

---

## 4. Check Patient Phone Number

```sql
SELECT id, full_name, phone
FROM patients
WHERE id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a';
```

**Expected:** Should show a valid 10-digit phone number
**If NULL:** Update with `UPDATE patients SET phone = '9876543210' WHERE id = '...'`

---

## 5. Test Edge Function Manually

Run this in PowerShell:

```powershell
$PROJECT_URL = "https://edwuptavjdakjuqyrxaf.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd3VwdGF2amRha2p1cXlyeGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzOTU1MSwiZXhwIjoyMDgzODE1NTUxfQ.aTofp-GOE2re7eZaGDhMFRoCbU0LcvNg-x0-Khg57Qo"

$body = @{
  user_id = "3f31cc72-a6a5-48a3-8e79-e9e29106179a"
  alert_type = "health_predictions"
  data = @{
    condition_name = "Manual Test"
    risk_level = "critical"
    recommendations = @("Test recommendation")
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "$PROJECT_URL/functions/v1/send-health-alert-sms" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

---

## 6. Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions → send-health-alert-sms**
3. Click **Logs** tab
4. Look for any errors or execution logs

---

## 7. Check if Edge Function is Deployed

```powershell
# Deploy/redeploy the function
cd d:\Health\Healthcare
npx supabase functions deploy send-health-alert-sms
```

---

## 8. Verify Fast2SMS API Key

1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Check if `FAST2SMS_API_KEY` is set
3. Verify the key is correct from Fast2SMS dashboard

---

## Common Issues

### Issue 1: Trigger Not Created
**Solution:** Run the SQL migration:
```sql
-- Copy and run the entire 008_sms_notification_triggers.sql file
```

### Issue 2: pg_net Not Enabled
**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Issue 3: Edge Function Not Deployed
**Solution:**
```powershell
npx supabase functions deploy send-health-alert-sms
```

### Issue 4: No Phone Number
**Solution:**
```sql
UPDATE patients SET phone = '9876543210' WHERE id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a';
```

### Issue 5: Wrong Service Role Key in Trigger
**Solution:** Edit `008_sms_notification_triggers.sql` and replace `YOUR_SERVICE_ROLE_KEY` with actual key, then re-run the migration

---

## Next Steps

1. Run queries 1-4 above
2. Share the results
3. I'll help identify the exact issue
