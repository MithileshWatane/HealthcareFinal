# Quick Fix: Testing with Service Role Key

## The Problem

The Edge Function needs **service role key** (admin access) to fetch all patients from the database. The anon key doesn't have permission to do this.

## Solution: Get Your Service Role Key

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/edwuptavjdakjuqyrxaf

2. **Navigate to Settings → API**

3. **Copy the `service_role` key** (NOT the anon key)
   - It's labeled as "service_role" and has a warning ⚠️ "This key has the ability to bypass Row Level Security"

4. **Use it to test:**

```powershell
# Replace YOUR_SERVICE_ROLE_KEY with the actual key
$PROJECT_URL = "https://edwuptavjdakjuqyrxaf.supabase.co"
$SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"  # Paste your service role key

Invoke-RestMethod -Uri "$PROJECT_URL/functions/v1/generate-daily-predictions" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
  }
```

## ⚠️ IMPORTANT: Keep Service Role Key Secret!

- **DO NOT** commit this key to git
- **DO NOT** share it publicly
- **DO NOT** use it in frontend code
- **ONLY** use it for:
  - Testing Edge Functions locally
  - Cron jobs (server-side)
  - Admin operations

## Alternative: Test Locally with Supabase CLI

If you don't want to use the service role key directly, you can test locally:

```bash
cd d:\Health\Healthcare

# Create .env.local file with your keys
echo "GEMINI_API_KEY=AIzaSyBTXTtt1YBvrd8dqqHPq2tEF8Ry2Dy4dRE" > supabase\.env.local
echo "SUPABASE_URL=https://edwuptavjdakjuqyrxaf.supabase.co" >> supabase\.env.local
echo "SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY" >> supabase\.env.local

# Serve the function locally
supabase functions serve generate-daily-predictions --env-file supabase\.env.local

# In another terminal, test it
curl -X POST http://localhost:54321/functions/v1/generate-daily-predictions
```

## Why Service Role Key is Needed

The Edge Function needs to:
1. Fetch **all patients** from the database (admin operation)
2. Access **all users' health data** (bypasses RLS)
3. Write predictions for **all users** (admin write access)

The anon key is restricted by Row Level Security (RLS) and can only access data for the authenticated user.

## For Production: Cron Job Will Use Service Role Key

When you set up the cron job, it will automatically use the service role key stored in Supabase secrets. This is secure because:
- The key is stored server-side only
- Never exposed to clients
- Only accessible to Supabase infrastructure

---

**Next Step:** Get your service role key from Supabase Dashboard and try the test again!
