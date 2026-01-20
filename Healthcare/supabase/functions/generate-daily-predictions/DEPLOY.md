# Fixed: Gemini API 404 Error

## What Was Wrong

The Edge Function was using the wrong Gemini model name:
- ❌ **Old:** `gemini-1.5-flash` (doesn't exist)
- ✅ **New:** `gemini-3-flash-preview` (correct)

## The Fix

Updated line 5 in `index.ts`:
```typescript
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
```

## How to Deploy the Fix

### Option 1: Install Supabase CLI (Recommended)

```powershell
# Install Supabase CLI
npm install -g supabase

# Deploy the function
cd d:\Health\Healthcare
supabase functions deploy generate-daily-predictions
```

### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/edwuptavjdakjuqyrxaf
2. Navigate to **Edge Functions**
3. Click **"New Function"** or find `generate-daily-predictions`
4. Copy the entire contents of `index.ts`
5. Paste it into the editor
6. Click **"Deploy"**

### Option 3: Use Supabase CLI with npx (No Install)

```powershell
cd d:\Health\Healthcare
npx supabase functions deploy generate-daily-predictions
```

## After Deployment, Test Again

```powershell
$PROJECT_URL = "https://edwuptavjdakjuqyrxaf.supabase.co"
$SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY"  # Use service role key

Invoke-RestMethod -Uri "$PROJECT_URL/functions/v1/generate-daily-predictions" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
  }
```

**Expected Success Response:**
```json
{
  "total": 4,
  "successful": 4,
  "failed": 0,
  "errors": []
}
```

## Environment Variables Needed

Make sure these are set in Supabase Dashboard → Edge Functions → Secrets:

- `GEMINI_API_KEY` = `AIzaSyBTXTtt1YBvrd8dqqHPq2tEF8Ry2Dy4dRE`
- `SUPABASE_URL` = `https://edwuptavjdakjuqyrxaf.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = Your service role key from Settings → API
