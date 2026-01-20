# Daily Health Predictions - Deployment Guide

## Overview

This system generates AI-powered health predictions once per day via a Supabase Edge Function, stores them in the database, and serves cached predictions to users for improved performance and reduced API costs.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project set up
- Gemini API key

## Step 1: Set Environment Variables

Add the following to your Supabase project secrets:

```bash
# In Supabase Dashboard: Settings → Edge Functions → Secrets
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 2: Deploy the Edge Function

```bash
cd d:\Health\Healthcare

# Deploy the function
supabase functions deploy generate-daily-predictions
```

## Step 3: Set Up Cron Job

### Option A: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Extensions**
3. Enable the `pg_cron` extension if not already enabled
4. Go to **SQL Editor** and run:

```sql
-- Create a cron job to run daily at 2:00 AM UTC (7:30 AM IST)
SELECT cron.schedule(
  'generate-daily-health-predictions',
  '0 2 * * *',  -- Every day at 2:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-predictions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    ) as request_id;
  $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference (e.g., `edwuptavjdakjuqyrxaf`)
- `YOUR_SERVICE_ROLE_KEY` with your Supabase service role key

### Option B: Using SQL Editor Directly

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job
SELECT cron.schedule(
  'generate-daily-health-predictions',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://edwuptavjdakjuqyrxaf.supabase.co/functions/v1/generate-daily-predictions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    ) as request_id;
  $$
);
```

## Step 4: Verify Cron Job

Check if the cron job is scheduled:

```sql
SELECT * FROM cron.job;
```

You should see an entry for `generate-daily-health-predictions`.

## Step 5: Test the Function Manually

Before waiting for the cron job, test the function manually:

```bash
# Using curl
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-predictions' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

Expected response:
```json
{
  "total": 5,
  "successful": 5,
  "failed": 0,
  "errors": []
}
```

## Step 6: Verify Database Storage

Check that predictions are being stored:

```sql
-- Check health predictions
SELECT * FROM health_predictions 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Check test recommendations
SELECT * FROM medical_test_recommendations 
WHERE is_completed = false 
ORDER BY created_at DESC 
LIMIT 10;

-- Check risk assessments
SELECT * FROM health_risk_assessments 
ORDER BY created_at DESC 
LIMIT 10;
```

## Step 7: Test Frontend

1. Open the QR patient profile page: `http://localhost:5173/qr?id=USER_ID`
2. Check browser console for: `"Using cached predictions from database"`
3. Verify that predictions show timestamp: `"📦 Cached · X hours ago"`
4. Click the "🔄 Refresh" button to test manual refresh
5. Reload the page multiple times - AI should NOT be called each time

## Monitoring

### View Cron Job Execution History

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'generate-daily-health-predictions')
ORDER BY start_time DESC 
LIMIT 10;
```

### View Edge Function Logs

In Supabase Dashboard:
1. Go to **Edge Functions**
2. Click on `generate-daily-predictions`
3. View **Logs** tab

## Troubleshooting

### Cron Job Not Running

```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check cron job status
SELECT * FROM cron.job WHERE jobname = 'generate-daily-health-predictions';

-- Manually trigger the job
SELECT cron.schedule('test-run', '* * * * *', 'SELECT 1');
SELECT cron.unschedule('test-run');
```

### Edge Function Errors

Check logs in Supabase Dashboard or run locally:

```bash
supabase functions serve generate-daily-predictions --env-file .env.local
```

### No Cached Predictions

1. Check if predictions table has data:
   ```sql
   SELECT COUNT(*) FROM health_predictions WHERE is_active = true;
   ```

2. Check if RLS policies are correct:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'health_predictions';
   ```

3. Verify user_id matches between `patients` table and `auth.users`

## Adjusting Cron Schedule

To change the schedule (e.g., run every 6 hours):

```sql
-- Unschedule existing job
SELECT cron.unschedule('generate-daily-health-predictions');

-- Create new schedule (every 6 hours)
SELECT cron.schedule(
  'generate-daily-health-predictions',
  '0 */6 * * *',  -- Every 6 hours
  $$ ... $$  -- Same SQL as before
);
```

## Performance Optimization

### Cache Duration

Currently set to 24 hours. To change, update `arePredictionsFresh()` in `api.js`:

```javascript
function arePredictionsFresh(predictions) {
    // Change 24 to desired hours
    return age !== null && age < 24;
}
```

### Batch Size

If you have many users, consider processing in batches:

```typescript
// In index.ts, process in chunks
const BATCH_SIZE = 10;
for (let i = 0; i < patients.length; i += BATCH_SIZE) {
    const batch = patients.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(patient => processPatient(patient)));
}
```

## Cost Savings

**Before:** 
- AI call on every page load
- ~100 calls/day per user (if they check 100 times)

**After:**
- 1 AI call per day per user
- **99% reduction in API costs** 🎉

## Next Steps

1. Monitor the cron job for a few days
2. Check Gemini API usage in Google Cloud Console
3. Verify user satisfaction with cached predictions
4. Consider adding email notifications for high-risk predictions
