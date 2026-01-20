# VAPI Voice Booking Configuration Guide

## Overview

This guide covers setting up VAPI (Voice API) for voice-based appointment booking as an alternative to ElevenLabs.

## Prerequisites

- VAPI account (sign up at [vapi.ai](https://vapi.ai))
- n8n workflows deployed
- API keys ready

## Step 1: Create VAPI Account

1. Go to [vapi.ai](https://vapi.ai)
2. Sign up and verify email
3. Get your API key from dashboard

## Step 2: Create Assistant via API

### Using VAPI Dashboard

1. Go to **Assistants** section
2. Click **Create New Assistant**
3. Configure settings (see below)

### Using API (Alternative)

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @assistant-config.json
```

## Step 3: Assistant Configuration

Create `assistant-config.json`:

```json
{
  "name": "Healthcare Booking Assistant",
  "firstMessage": "Hello! Welcome to our healthcare clinic. I'm here to help you book an appointment with one of our doctors. Which specialty are you looking for?",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "systemPrompt": "You are a friendly and professional medical receptionist for a healthcare clinic. Your role is to help patients book appointments with our doctors.\n\nAVAILABLE DOCTORS:\n1. Dr. Sarah Chen - General Physician (ID: 1)\n2. Dr. Michael Roberts - Cardiologist (ID: 2)\n3. Dr. Emily Watson - Dermatologist (ID: 3)\n\nBOOKING PROCESS:\n1. Greet the patient warmly\n2. Ask which doctor or specialty they need\n3. Ask for preferred date and time\n4. Use checkAvailability function to verify the slot\n5. Collect patient information (name, phone, email)\n6. Use bookAppointment function to confirm booking\n7. Provide confirmation details\n\nBe empathetic, professional, and efficient. Always confirm details before booking.",
    "maxTokens": 250
  },
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en-US"
  },
  "functions": [
    {
      "name": "checkAvailability",
      "description": "Check if a doctor is available at the requested date and time",
      "parameters": {
        "type": "object",
        "properties": {
          "doctor_id": {
            "type": "string",
            "description": "The ID of the doctor (1, 2, or 3)"
          },
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format"
          },
          "time": {
            "type": "string",
            "description": "Time in HH:MM format (24-hour)"
          }
        },
        "required": ["doctor_id", "date", "time"]
      },
      "url": "https://your-n8n-instance.com/webhook/check-availability",
      "method": "POST"
    },
    {
      "name": "bookAppointment",
      "description": "Book an appointment after availability is confirmed",
      "parameters": {
        "type": "object",
        "properties": {
          "session_id": {
            "type": "string",
            "description": "Unique session identifier"
          },
          "doctor_id": {
            "type": "string",
            "description": "The ID of the doctor"
          },
          "doctor_name": {
            "type": "string",
            "description": "Full name of the doctor"
          },
          "specialty": {
            "type": "string",
            "description": "Doctor's specialty"
          },
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format"
          },
          "time": {
            "type": "string",
            "description": "Time in HH:MM format"
          },
          "patient_name": {
            "type": "string",
            "description": "Full name of the patient"
          },
          "patient_phone": {
            "type": "string",
            "description": "Patient's phone number"
          },
          "patient_email": {
            "type": "string",
            "description": "Patient's email address"
          }
        },
        "required": ["session_id", "doctor_id", "doctor_name", "date", "time", "patient_name"]
      },
      "url": "https://your-n8n-instance.com/webhook/book-appointment",
      "method": "POST"
    }
  ],
  "endCallFunctionEnabled": true,
  "recordingEnabled": true,
  "hipaaEnabled": true
}
```

## Step 4: Voice Configuration

### Voice Providers

VAPI supports multiple TTS providers:

1. **ElevenLabs** (Recommended for quality)
   ```json
   {
     "provider": "elevenlabs",
     "voiceId": "21m00Tcm4TlvDq8ikWAM"
   }
   ```

2. **PlayHT**
   ```json
   {
     "provider": "playht",
     "voiceId": "s3://voice-cloning-zero-shot/..."
   }
   ```

3. **Azure**
   ```json
   {
     "provider": "azure",
     "voiceId": "en-US-JennyNeural"
   }
   ```

## Step 5: Phone Number Setup

### Inbound Calls

1. Go to **Phone Numbers** in VAPI dashboard
2. Click **Buy Number**
3. Select country and area code
4. Assign to your assistant

### Outbound Calls

Configure via API:

```javascript
const call = await vapi.calls.create({
  assistantId: "your-assistant-id",
  customer: {
    number: "+1234567890"
  }
});
```

## Step 6: Web Integration

### Install VAPI SDK

```bash
npm install @vapi-ai/web
```

### React Integration

```typescript
import { useVapi } from '@vapi-ai/web';

function VoiceBooking() {
  const { start, stop, isSessionActive } = useVapi({
    apiKey: 'YOUR_PUBLIC_API_KEY',
    assistant: 'YOUR_ASSISTANT_ID',
    onSpeechStart: () => console.log('User started speaking'),
    onSpeechEnd: () => console.log('User stopped speaking'),
    onCallEnd: () => console.log('Call ended'),
    onError: (error) => console.error('Error:', error)
  });

  return (
    <div>
      <button onClick={start}>Start Voice Booking</button>
      <button onClick={stop}>End Call</button>
      {isSessionActive && <p>Call in progress...</p>}
    </div>
  );
}
```

### Vanilla JavaScript

```html
<script src="https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"></script>
<script>
  const vapi = new Vapi('YOUR_PUBLIC_API_KEY');

  async function startCall() {
    await vapi.start('YOUR_ASSISTANT_ID');
  }

  async function endCall() {
    await vapi.stop();
  }
</script>
```

## Step 7: Advanced Features

### Call Recording

```json
{
  "recordingEnabled": true,
  "recordingPath": "s3://your-bucket/recordings/"
}
```

### Analytics & Monitoring

```javascript
vapi.on('call-end', (call) => {
  console.log('Call duration:', call.duration);
  console.log('Transcript:', call.transcript);
  console.log('Cost:', call.cost);
});
```

### Custom Webhooks

```json
{
  "serverUrl": "https://your-server.com/vapi-webhook",
  "serverUrlSecret": "your-webhook-secret"
}
```

## Pricing

**VAPI Pricing** (as of 2026):

- **Voice Usage**: $0.05-0.10 per minute
- **Transcription**: $0.006 per minute
- **LLM Costs**: Pass-through (OpenAI GPT-4: ~$0.03 per 1K tokens)

**Estimated Cost per Booking**:
- Average call: 3-5 minutes
- Total: ~$0.20-0.40 per booking

## Testing

### Test Call via Dashboard

1. Go to **Assistants**
2. Click **Test Call**
3. Speak to test the flow

### Test via API

```bash
curl -X POST https://api.vapi.ai/call \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "YOUR_ASSISTANT_ID",
    "customer": {
      "number": "+1234567890"
    }
  }'
```

## Monitoring & Debugging

### View Call Logs

```javascript
const calls = await vapi.calls.list({
  limit: 10,
  assistantId: 'YOUR_ASSISTANT_ID'
});
```

### Analyze Transcripts

```javascript
const call = await vapi.calls.get('CALL_ID');
console.log(call.transcript);
console.log(call.messages);
```

## Comparison: VAPI vs ElevenLabs

| Feature | VAPI | ElevenLabs |
|---------|------|------------|
| Voice Quality | Good (depends on provider) | Excellent |
| Customization | High | Medium |
| Phone Integration | Native | Via third-party |
| Pricing | $0.20-0.40/booking | $0.10-0.30/booking |
| Setup Complexity | Medium | Easy |
| Best For | Phone systems, high control | Web integration, voice quality |

## Troubleshooting

### Function not being called
- Check function schema matches n8n expectations
- Verify webhook URLs are accessible
- Review system prompt for clear instructions

### Poor transcription
- Try different transcriber (Deepgram vs AssemblyAI)
- Adjust language settings
- Check audio quality

### High latency
- Use faster LLM model (GPT-3.5 instead of GPT-4)
- Optimize function response times
- Choose closer server regions

## Next Steps

1. Create VAPI account and get API key
2. Configure assistant with functions
3. Test thoroughly
4. Integrate with website
5. Monitor usage and costs

## Resources

- VAPI Documentation: [docs.vapi.ai](https://docs.vapi.ai)
- API Reference: [docs.vapi.ai/api-reference](https://docs.vapi.ai/api-reference)
- Discord Community: [vapi.ai/discord](https://vapi.ai/discord)
