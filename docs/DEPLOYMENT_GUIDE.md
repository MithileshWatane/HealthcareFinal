# Voice Booking System - Deployment Guide

## Overview

This guide covers the complete deployment process for the voice booking system, from database setup to production deployment.

## Prerequisites

- Supabase project set up
- n8n instance (cloud or self-hosted)
- ElevenLabs or VAPI account
- Node.js and npm installed

## Step 1: Database Setup

### Run Migrations

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the migration file: `supabase/migrations/20260118_voice_bookings.sql`
4. Execute the SQL to create tables and functions

**Or via CLI**:
```bash
cd d:\Health\Healthcare
npx supabase db push
```

### Verify Tables

Check that these tables were created:
- `voice_booking_sessions`
- `voice_booking_attempts`

Check that these RPC functions exist:
- `check_doctor_availability`
- `create_voice_booking`

## Step 2: Deploy Supabase Edge Functions

### Deploy check-availability function

```bash
cd d:\Health\Healthcare
npx supabase functions deploy check-availability
```

### Deploy book-appointment function

```bash
npx supabase functions deploy book-appointment
```

### Set Environment Variables

```bash
npx supabase secrets set SUPABASE_URL=your_supabase_url
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Test Edge Functions

```bash
# Test availability check
curl -X POST https://your-project.supabase.co/functions/v1/check-availability \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "1",
    "date": "2026-01-20",
    "time": "10:00"
  }'

# Test booking
curl -X POST https://your-project.supabase.co/functions/v1/book-appointment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "doctor_id": "1",
    "doctor_name": "Dr. Sarah Chen",
    "specialty": "General Physician",
    "date": "2026-01-20",
    "time": "10:00",
    "patient_name": "Test Patient",
    "patient_phone": "+1234567890",
    "patient_email": "test@example.com"
  }'
```

## Step 3: Deploy n8n Workflows

### Option A: n8n Cloud

1. Log in to [n8n.cloud](https://n8n.cloud)
2. Create new workflow
3. Click **Import from File**
4. Import `n8n/workflows/check-availability.json`
5. Configure environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
6. Activate workflow
7. Copy webhook URL
8. Repeat for `book-appointment.json`

### Option B: Self-Hosted

1. Start n8n:
   ```bash
   docker-compose up -d
   ```

2. Access n8n at `http://localhost:5678`

3. Import workflows via UI

4. Set environment variables in docker-compose.yml:
   ```yaml
   environment:
     - SUPABASE_URL=your_url
     - SUPABASE_KEY=your_key
   ```

5. Activate workflows

### Get Webhook URLs

After activation, copy the webhook URLs:
- Check Availability: `https://your-n8n.com/webhook/check-availability`
- Book Appointment: `https://your-n8n.com/webhook/book-appointment`

## Step 4: Configure Voice AI

### For ElevenLabs

Follow the detailed guide: `docs/ELEVENLABS_SETUP.md`

**Quick Steps**:
1. Create agent at [elevenlabs.io](https://elevenlabs.io)
2. Configure system prompt (see guide)
3. Add custom tools with n8n webhook URLs
4. Test conversation flow
5. Get Agent ID for website integration

### For VAPI

Follow the detailed guide: `docs/VAPI_SETUP.md`

**Quick Steps**:
1. Create account at [vapi.ai](https://vapi.ai)
2. Create assistant via API or dashboard
3. Configure functions with n8n webhook URLs
4. Test via dashboard
5. Get API key and Assistant ID

## Step 5: Deploy Frontend

### Update Environment Variables

Create or update `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id  # If using ElevenLabs
VITE_VAPI_PUBLIC_KEY=your_vapi_key      # If using VAPI
```

### Build Application

```bash
cd d:\Health\Healthcare
npm install
npm run build
```

### Deploy to Hosting

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 3: Custom Server**
```bash
# Copy dist folder to your server
scp -r dist/* user@server:/var/www/html/
```

## Step 6: Testing

### Test Checklist

- [ ] Database tables created successfully
- [ ] Edge functions deployed and responding
- [ ] n8n workflows active and accessible
- [ ] Voice AI agent configured correctly
- [ ] Website deployed and accessible
- [ ] Voice booking button appears on appointments page
- [ ] Voice widget opens correctly
- [ ] End-to-end booking flow works
- [ ] Confirmation emails sent (if configured)
- [ ] Bookings appear in database

### Test Scenarios

1. **Happy Path**
   - Click "Book via Voice"
   - Request available doctor and time
   - Complete booking
   - Verify in database

2. **Unavailable Slot**
   - Request already booked time
   - Verify alternative suggestions
   - Book alternative time

3. **Error Handling**
   - Test with invalid data
   - Test network interruptions
   - Verify error messages

## Step 7: Monitoring

### Database Monitoring

```sql
-- Check recent bookings
SELECT * FROM voice_booking_sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM voice_booking_sessions
GROUP BY status;
```

### n8n Monitoring

- Check execution logs in n8n dashboard
- Monitor webhook response times
- Review failed executions

### Voice AI Monitoring

**ElevenLabs**:
- Check usage in dashboard
- Review conversation transcripts
- Monitor costs

**VAPI**:
- Use VAPI analytics dashboard
- Review call logs and transcripts
- Monitor per-minute costs

## Troubleshooting

### Voice widget not appearing
- Check browser console for errors
- Verify component import in Appointments.tsx
- Check build output for errors

### Webhooks not responding
- Verify n8n workflows are active
- Check webhook URLs are correct
- Test webhooks directly with curl
- Review n8n execution logs

### Bookings not saving to database
- Check Supabase Edge Function logs
- Verify RPC functions exist
- Check database permissions
- Review SQL migration execution

### Voice AI not calling webhooks
- Verify webhook URLs in voice AI config
- Check webhook accessibility (not localhost)
- Review voice AI logs
- Test webhooks independently

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly

### Database
- Enable Row Level Security (RLS) on Supabase
- Limit service role key usage
- Use anon key for client-side operations

### Webhooks
- Implement webhook signature verification
- Use HTTPS only
- Rate limit webhook endpoints

## Performance Optimization

### Database
- Indexes already created in migration
- Monitor query performance
- Consider caching for doctor availability

### n8n
- Optimize workflow execution time
- Use async operations where possible
- Monitor memory usage

### Voice AI
- Choose appropriate voice model (quality vs speed)
- Optimize system prompts for conciseness
- Monitor latency metrics

## Backup & Recovery

### Database Backups
- Supabase provides automatic backups
- Export data regularly:
  ```bash
  npx supabase db dump -f backup.sql
  ```

### Workflow Backups
- Export n8n workflows regularly
- Version control workflow JSON files
- Document workflow changes

## Cost Monitoring

### Expected Monthly Costs

**For 100 bookings/month**:
- Supabase: Free tier (sufficient)
- n8n Cloud: $20/month
- ElevenLabs: ~$10-30/month
- VAPI: ~$20-40/month
- **Total**: ~$50-90/month

### Cost Optimization
- Use free tiers where possible
- Monitor usage dashboards
- Set up billing alerts
- Optimize conversation length

## Next Steps

1. Complete deployment following this guide
2. Test thoroughly in staging environment
3. Monitor initial production usage
4. Gather user feedback
5. Iterate and improve based on data

## Support Resources

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- n8n Docs: [docs.n8n.io](https://docs.n8n.io)
- ElevenLabs Docs: [docs.elevenlabs.io](https://docs.elevenlabs.io)
- VAPI Docs: [docs.vapi.ai](https://docs.vapi.ai)
