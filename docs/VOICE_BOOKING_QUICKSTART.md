# Voice Booking Quick Start Guide

## Prerequisites Completed ✅

- Database schema created
- Edge Functions ready
- n8n workflows prepared
- Frontend components built
- ElevenLabs SDK installed

## Quick Setup Steps

### 1. Configure Environment Variables

Add to your `.env` file:

```env
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### 2. Set Up ElevenLabs Agent

1. Go to [elevenlabs.io](https://elevenlabs.io) and sign up
2. Navigate to **Conversational AI** → **Create Agent**
3. Configure agent settings:

**System Prompt** (copy this):
```
You are a friendly medical receptionist for a healthcare clinic helping patients book appointments.

AVAILABLE DOCTORS:
1. Dr. Sarah Chen - General Physician (ID: 1)
2. Dr. Michael Roberts - Cardiologist (ID: 2)
3. Dr. Emily Watson - Dermatologist (ID: 3)

PROCESS:
1. Greet warmly
2. Ask which doctor/specialty they need
3. Ask for preferred date and time
4. Use checkAvailability to verify slot
5. Collect patient info (name, phone, email)
6. Use bookAppointment to confirm
7. Provide confirmation

Be empathetic and professional. Always confirm details before booking.
```

4. Add Custom Tools (see detailed guide: `docs/ELEVENLABS_SETUP.md`)
5. Copy your **Agent ID**

### 3. Deploy Database & Functions

```bash
# Deploy database migration
cd d:\Health\Healthcare
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy check-availability
npx supabase functions deploy book-appointment
```

### 4. Set Up n8n

**Quick Option - n8n Cloud**:
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import `n8n/workflows/check-availability.json`
3. Import `n8n/workflows/book-appointment.json`
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Activate workflows
6. Copy webhook URLs

### 5. Configure ElevenLabs Tools

In your ElevenLabs agent, add these webhook URLs to the custom tools:

- **checkAvailability**: `https://your-n8n.com/webhook/check-availability`
- **bookAppointment**: `https://your-n8n.com/webhook/book-appointment`

### 6. Test the Integration

```bash
# Start development server
npm run dev

# Navigate to http://localhost:5173/appointments
# Click "Book via Voice"
# Test the booking flow
```

## Testing Checklist

- [ ] Voice widget opens
- [ ] ElevenLabs connection established
- [ ] Can speak and be heard
- [ ] Agent responds appropriately
- [ ] Availability check works
- [ ] Booking is created
- [ ] Confirmation is given

## Troubleshooting

**"Agent ID not configured" error**:
- Make sure `.env` has `VITE_ELEVENLABS_AGENT_ID`
- Restart dev server after adding env vars

**Voice not connecting**:
- Check browser microphone permissions
- Verify Agent ID is correct
- Check browser console for errors

**Webhooks not working**:
- Verify n8n workflows are active
- Test webhook URLs directly with curl
- Check n8n execution logs

## Next Steps

1. Complete the setup steps above
2. Test thoroughly
3. Deploy to production (see `docs/DEPLOYMENT_GUIDE.md`)
4. Monitor usage and costs

## Cost Estimate

- **n8n Cloud**: $20/month
- **ElevenLabs**: ~$10-30/month (100 bookings)
- **Total**: ~$30-50/month

## Full Documentation

- **ElevenLabs Setup**: `docs/ELEVENLABS_SETUP.md`
- **VAPI Setup**: `docs/VAPI_SETUP.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Implementation Walkthrough**: See artifacts

## Support

If you encounter issues:
1. Check browser console for errors
2. Review n8n execution logs
3. Check ElevenLabs agent logs
4. Verify all environment variables are set
5. Test each component independently
