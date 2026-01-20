# Manual Testing Guide - Daily Predictions System

## Quick Start Testing

### Step 1: Deploy the Edge Function

```bash
cd d:\Health\Healthcare

# Deploy to Supabase
supabase functions deploy generate-daily-predictions
```

### Step 2: Test the Function Manually

#### Option A: Using PowerShell (Recommended for Windows)

```powershell
# Replace with your actual values
$PROJECT_URL = "https://edwuptavjdakjuqyrxaf.supabase.co"
$ANON_KEY = "sb_publishable_cHYdCX_v8CTBV0VlqaaAwQ_GR-17x_Y"

# Call the function
Invoke-RestMethod -Uri "$PROJECT_URL/functions/v1/generate-daily-predictions" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $ANON_KEY"
    "Content-Type" = "application/json"
  }
```

#### Option B: Using curl (if you have it installed)

```bash
curl -X POST https://edwuptavjdakjuqyrxaf.supabase.co/functions/v1/generate-daily-predictions \
  -H "Authorization: Bearer sb_publishable_cHYdCX_v8CTBV0VlqaaAwQ_GR-17x_Y" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "total": 5,
  "successful": 5,
  "failed": 0,
  "errors": []
}
```

### Step 3: Verify Database Storage

Open Supabase Dashboard → SQL Editor and run:

```sql
-- Check if predictions were created
SELECT 
  id,
  user_id,
  condition_name,
  risk_score,
  risk_level,
  created_at,
  is_active
FROM health_predictions 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Check test recommendations
SELECT 
  id,
  user_id,
  test_name,
  priority_level,
  created_at
FROM medical_test_recommendations 
WHERE is_completed = false 
ORDER BY created_at DESC 
LIMIT 10;

-- Check risk assessments
SELECT 
  id,
  user_id,
  assessment_type,
  overall_risk_score,
  risk_level,
  created_at
FROM health_risk_assessments 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 4: Test Frontend Caching

1. **Open the QR page** in your browser:
   ```
   http://localhost:5173/qr?id=YOUR_USER_ID
   ```
   (Replace `YOUR_USER_ID` with an actual patient ID from your database)

2. **Open Browser Console** (F12 → Console tab)

3. **Look for these messages:**
   - ✅ `"Using cached predictions from database"` - Good! Cache is working
   - ⚠️ `"Generating new AI-powered health predictions..."` - First load or stale cache

4. **Check the UI:**
   - Should see: `📦 Cached · X hours ago` (if using cached predictions)
   - Should see: `✨ Fresh · X minutes ago` (if just generated)
   - Should see: `🔄 Refresh` button

5. **Test Refresh Button:**
   - Click the `🔄 Refresh` button
   - Should see loading spinner
   - Should generate new predictions
   - Should update to `✨ Fresh · 0 minutes ago`

6. **Reload Page Multiple Times:**
   - Press F5 to reload
   - Console should show `"Using cached predictions from database"`
   - Page should load FAST (< 1 second)
   - AI should NOT be called each time

### Step 5: Test Cache Expiration

To test that stale predictions trigger new generation:

```sql
-- Manually make predictions "old" (set created_at to 25 hours ago)
UPDATE health_predictions 
SET created_at = NOW() - INTERVAL '25 hours'
WHERE user_id = 'YOUR_USER_ID';

UPDATE medical_test_recommendations 
SET created_at = NOW() - INTERVAL '25 hours'
WHERE user_id = 'YOUR_USER_ID';

UPDATE health_risk_assessments 
SET created_at = NOW() - INTERVAL '25 hours'
WHERE user_id = 'YOUR_USER_ID';
```

Now reload the QR page - it should generate NEW predictions because the cached ones are > 24 hours old.

---

## Troubleshooting

### Error: "Failed to fetch patients"

**Cause:** Service role key not set or incorrect

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT anon key)
3. Go to Edge Functions → Secrets
4. Add secret: `SUPABASE_SERVICE_ROLE_KEY` = your service role key

### Error: "Gemini API error: 400"

**Cause:** Invalid API key or quota exceeded

**Fix:**
1. Check your Gemini API key in Edge Functions → Secrets
2. Verify key is correct: `GEMINI_API_KEY`
3. Check quota in Google Cloud Console

### No predictions showing in database

**Cause:** RLS policies blocking access or no patients in database

**Fix:**
```sql
-- Check if patients exist
SELECT COUNT(*) FROM patients;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'health_predictions';

-- Temporarily disable RLS to test (DON'T DO IN PRODUCTION)
ALTER TABLE health_predictions DISABLE ROW LEVEL SECURITY;
```

### Frontend shows "Generating..." forever

**Cause:** JavaScript error or API call failing

**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check Network tab for failed requests
4. Verify `config.js` has correct Supabase URL and keys

---

## Quick Verification Checklist

- [ ] Edge Function deployed successfully
- [ ] Manual function call returns success response
- [ ] Database tables have new prediction records
- [ ] QR page loads and shows predictions
- [ ] Console shows "Using cached predictions"
- [ ] Timestamp displays correctly
- [ ] Refresh button works
- [ ] Page reload uses cache (doesn't call AI)

---

## Performance Testing

### Before (Without Caching)

1. Open QR page
2. Open Network tab (F12 → Network)
3. Look for call to `generativelanguage.googleapis.com`
4. Reload page 5 times
5. **Expected:** 5 calls to Gemini API ❌

### After (With Caching)

1. Open QR page
2. Open Network tab (F12 → Network)
3. Look for calls to Supabase (should see database queries)
4. Reload page 5 times
5. **Expected:** 0 calls to Gemini API ✅

---

## Next: Set Up Cron Job

Once manual testing passes, set up the cron job to run automatically:

See [README.md](file:///d:/Health/Healthcare/supabase/functions/generate-daily-predictions/README.md) for cron job setup instructions.
