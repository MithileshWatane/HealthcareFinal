# WhatsApp Notification System - Twilio Setup Guide

## Overview

Send **WhatsApp notifications** to patients for critical health alerts using Twilio!

- ✅ **Rich formatting** with emojis and bold text
- ✅ **Instant delivery** via WhatsApp
- ✅ **Free Twilio trial** - $15 credit (~200 messages)
- ✅ **Better engagement** than SMS or email

---

## Step 1: Set Up Twilio WhatsApp Sandbox

### Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account (get $15 credit)
3. Verify your phone number

### Activate WhatsApp Sandbox

1. Login to Twilio Console
2. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see a sandbox number like: `+1 415 523 8886`
4. **Join the sandbox:**
   - Send a WhatsApp message to the sandbox number
   - Message format: `join <your-sandbox-code>` (e.g., `join happy-tiger`)
   - You'll receive a confirmation message

### Get Twilio Credentials

1. Go to Twilio Console Dashboard
2. Find your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
   - **WhatsApp Sandbox Number** (e.g., `whatsapp:+14155238886`)

---

## Step 2: Add Twilio Credentials to Supabase

Go to **Supabase Dashboard → Edge Functions → Secrets** and add:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## Step 3: Update Patient Phone Number

WhatsApp needs a valid phone number **with country code**:

```sql
-- Update patient phone with country code (+91 for India)
UPDATE patients 
SET phone = '+919876543210'  -- Include +91 country code
WHERE id = '3f31cc72-a6a5-48a3-8e79-e9e29106179a';
```

**Important:** Phone number must be in format `+[country_code][number]` (e.g., `+919876543210`)

---

## Step 4: Deploy the Edge Function

```powershell
cd d:\Health\Healthcare
npx supabase functions deploy send-health-alert-sms
```

---

## Step 5: Test WhatsApp Notification

### Manual Test

```powershell
$PROJECT_URL = "https://edwuptavjdakjuqyrxaf.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd3VwdGF2amRha2p1cXlyeGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzOTU1MSwiZXhwIjoyMDgzODE1NTUxfQ.aTofp-GOE2re7eZaGDhMFRoCbU0LcvNg-x0-Khg57Qo"

$body = @{
  user_id = "3f31cc72-a6a5-48a3-8e79-e9e29106179a"
  alert_type = "health_predictions"
  data = @{
    condition_name = "Test Critical Condition"
    risk_level = "critical"
    risk_score = 85
    description = "This is a test WhatsApp alert"
    recommendations = @("Consult doctor immediately", "Monitor symptoms", "Follow treatment plan")
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

### Test via Database Insert

```sql
INSERT INTO health_predictions (
  user_id, prediction_type, condition_name, risk_score, risk_level,
  description, recommendations, is_active
) VALUES (
  '3f31cc72-a6a5-48a3-8e79-e9e29106179a',
  'condition_risk',
  'Test WhatsApp Alert',
  90,
  'critical',
  'Testing WhatsApp notification',
  ARRAY['Seek immediate medical attention', 'Monitor vital signs'],
  true
);
```

**Expected:** WhatsApp message received on your phone! 📱

---

## WhatsApp Message Preview

### Critical Health Alert

```
🚨 *CRITICAL HEALTH ALERT*

Dear Hackmatez,

⚠️ *Critical Risk Detected*
Condition: *Severe Dehydration*
Risk Level: *CRITICAL*
Risk Score: 95/100

📋 Zero fluid intake poses immediate risk to renal function

*Recommended Actions:*
1. Increase water intake immediately to 2-3 liters/day
2. Monitor urine color and output
3. Seek medical attention if experiencing dizziness

*Next Steps:*
1. Review full details in your health dashboard
2. Consult with your healthcare provider
3. Follow the recommended actions above

_This is an automated health alert from your Healthcare System._
```

### Urgent Medical Test

```
⚕️ *URGENT MEDICAL TEST REQUIRED*

Dear Hackmatez,

*Test Name:* Complete Blood Count (CBC)
*Priority:* URGENT
*Category:* diagnostic

*Reason:*
To check for anemia and infection markers based on recent symptoms

*Frequency:* Once immediately, then follow-up in 3 months

⚠️ *Action Required:*
Please schedule this test as soon as possible. Contact your healthcare provider to book an appointment.

_This is an automated health alert from your Healthcare System._
```

---

## Troubleshooting

### WhatsApp Not Sending

**1. Check if you joined the sandbox:**
- Send `join <code>` to Twilio's WhatsApp number
- You should receive a confirmation

**2. Verify credentials:**
- Check Supabase secrets are set correctly
- Account SID starts with `AC`
- WhatsApp number format: `whatsapp:+14155238886`

**3. Check phone number format:**
```sql
SELECT phone FROM patients WHERE id = 'your-user-id';
```
- Should be 10 digits for India (e.g., `9876543210`)
- Function adds `+91` automatically

**4. Check Twilio logs:**
- Go to Twilio Console → Monitor → Logs → Messaging
- Look for delivery status and errors

### Common Errors

**"To number is not a valid WhatsApp number"**
- Make sure the recipient joined the sandbox
- Verify phone number format

**"Authentication failed"**
- Check Account SID and Auth Token are correct
- Make sure there are no extra spaces

**"Insufficient balance"**
- Free trial has $15 credit
- Add more credits if needed

---

## Production Setup (After Testing)

For production use, you need to:

1. **Get WhatsApp Business Account**
   - Apply through Twilio
   - Get approved by Meta/WhatsApp
   - Use your own WhatsApp number

2. **Message Templates**
   - Create pre-approved message templates
   - Required for production WhatsApp messaging

3. **Pricing**
   - Conversation-based pricing
   - ~$0.005-0.01 per conversation
   - Much cheaper than SMS!

---

## Cost Comparison

| Service | Free Tier | Cost per Message |
|---------|-----------|------------------|
| SMS (Twilio) | $15 credit | $0.0079 (~₹0.65) |
| **WhatsApp** | **$15 credit** | **$0.005 (~₹0.40)** ✅ |
| Email (Resend) | 3,000/month | FREE |

**WhatsApp is 40% cheaper than SMS!** 🎉

---

## Next Steps

1. ✅ Create Twilio account
2. ✅ Join WhatsApp sandbox
3. ✅ Add credentials to Supabase
4. ✅ Deploy function
5. ✅ Test with your phone
6. ⏳ Set up database triggers
7. ⏳ Monitor for 24 hours

The WhatsApp notification system is ready! �
