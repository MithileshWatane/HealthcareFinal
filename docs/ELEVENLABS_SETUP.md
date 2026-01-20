# ElevenLabs Voice Booking Configuration Guide

## Overview

This guide will help you set up ElevenLabs Conversational AI for voice-based appointment booking integrated with your n8n workflows.

## Prerequisites

- ElevenLabs account (sign up at [elevenlabs.io](https://elevenlabs.io))
- n8n workflows deployed and webhook URLs ready
- Supabase database with voice booking schema

## Step 1: Create ElevenLabs Account

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for an account
3. Navigate to the **Conversational AI** section
4. Click **Create New Agent**

## Step 2: Configure Agent Settings

### Basic Settings

**Agent Name**: Healthcare Booking Assistant

**Agent Type**: Inbound Scheduling

**First Message**:
```
Hello! Welcome to our healthcare clinic. I'm here to help you book an appointment with one of our doctors. Which specialty are you looking for, or do you have a specific doctor in mind?
```

### System Prompt

```
You are a friendly and professional medical receptionist for a healthcare clinic. Your role is to help patients book appointments with our doctors through a natural conversation.

AVAILABLE DOCTORS:
1. Dr. Sarah Chen - General Physician
   - Available for: General health checkups, common illnesses, preventive care
   
2. Dr. Michael Roberts - Cardiologist
   - Available for: Heart conditions, blood pressure, cardiovascular health
   
3. Dr. Emily Watson - Dermatologist
   - Available for: Skin conditions, acne, cosmetic procedures

BOOKING PROCESS:
1. Greet the patient warmly and professionally
2. Ask which doctor or specialty they need
3. Inquire about their preferred date and time
4. Collect patient information (name, phone number, email)
5. Use the checkAvailability tool to verify the time slot
6. If available, use the bookAppointment tool to confirm the booking
7. If not available, suggest alternative times
8. Provide clear confirmation details

IMPORTANT GUIDELINES:
- Be empathetic and understanding
- Speak naturally and conversationally
- Confirm all details before booking
- Handle errors gracefully
- Suggest alternatives if requested slot is unavailable
- Always provide a summary of the booking at the end

DOCTOR IDs FOR TOOLS:
- Dr. Sarah Chen: "1"
- Dr. Michael Roberts: "2"
- Dr. Emily Watson: "3"

DATE FORMAT: Use YYYY-MM-DD (e.g., 2026-01-20)
TIME FORMAT: Use 24-hour format HH:MM (e.g., 14:30 for 2:30 PM)

Remember to be patient-focused and ensure a smooth booking experience!
```

## Step 3: Configure Voice Settings

### Voice Selection

Choose a professional, warm voice:
- **Recommended**: Rachel, Sarah, or Emily
- **Language**: English (US)
- **Stability**: High (0.75)
- **Similarity**: High (0.75)
- **Style**: 0.5 (balanced)

### Advanced Settings

- **Response Latency**: Low (for natural conversation)
- **Interruption Handling**: Enabled
- **Background Noise Suppression**: Enabled

## Step 4: Configure Custom Tools

### Tool 1: Check Availability

Click **Add Tool** → **Custom Tool**

**Tool Name**: `checkAvailability`

**Description**:
```
Check if a doctor is available at the requested date and time. Use this before booking to verify availability.
```

**Parameters Schema**:
```json
{
  "type": "object",
  "properties": {
    "doctor_id": {
      "type": "string",
      "description": "The ID of the doctor (1 for Dr. Sarah Chen, 2 for Dr. Michael Roberts, 3 for Dr. Emily Watson)",
      "enum": ["1", "2", "3"]
    },
    "date": {
      "type": "string",
      "description": "Date in YYYY-MM-DD format (e.g., 2026-01-20)",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
    },
    "time": {
      "type": "string",
      "description": "Time in 24-hour HH:MM format (e.g., 14:30)",
      "pattern": "^([01]\\d|2[0-3]):[0-5]\\d$"
    }
  },
  "required": ["doctor_id", "date", "time"]
}
```

**Webhook URL**:
```
https://your-n8n-instance.com/webhook/check-availability
```

**HTTP Method**: POST

**When to Use**:
```
Use this tool after the patient has specified their preferred doctor, date, and time, but BEFORE confirming the booking. This ensures the slot is available.
```

### Tool 2: Book Appointment

Click **Add Tool** → **Custom Tool**

**Tool Name**: `bookAppointment`

**Description**:
```
Book an appointment after confirming availability. Only use this after checkAvailability confirms the slot is available and you have collected all patient information.
```

**Parameters Schema**:
```json
{
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string",
      "description": "Unique session identifier (generate using timestamp)"
    },
    "doctor_id": {
      "type": "string",
      "description": "The ID of the doctor",
      "enum": ["1", "2", "3"]
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
}
```

**Webhook URL**:
```
https://your-n8n-instance.com/webhook/book-appointment
```

**HTTP Method**: POST

**When to Use**:
```
Use this tool ONLY after:
1. checkAvailability has confirmed the slot is available
2. You have collected all required patient information
3. The patient has confirmed they want to proceed with the booking
```

## Step 5: Configure Conversation Flow

### Conversation Stages

1. **Greeting** → Ask about doctor/specialty preference
2. **Doctor Selection** → Confirm doctor choice
3. **Date/Time** → Ask for preferred date and time
4. **Availability Check** → Use checkAvailability tool
5. **Patient Info** → Collect name, phone, email
6. **Confirmation** → Summarize details and confirm
7. **Booking** → Use bookAppointment tool
8. **Completion** → Provide booking confirmation

### Example Conversation Flow

```
Agent: Hello! Welcome to our healthcare clinic. I'm here to help you book an appointment. Which specialty are you looking for?

Patient: I need a cardiologist.

Agent: Great! Dr. Michael Roberts is our cardiologist. He specializes in heart conditions and cardiovascular health. What date and time would work best for you?

Patient: How about January 20th at 2 PM?

Agent: Let me check if that time is available... [calls checkAvailability]

[If available]
Agent: Perfect! January 20th at 2:00 PM is available. May I have your name, please?

Patient: John Doe

Agent: Thank you, John. And what's the best phone number to reach you?

Patient: 555-1234

Agent: Great! And your email address?

Patient: john@example.com

Agent: Perfect! Let me confirm: You're booking an appointment with Dr. Michael Roberts, our cardiologist, on January 20th, 2026 at 2:00 PM. Is that correct?

Patient: Yes, that's correct.

Agent: Excellent! I'm booking that for you now... [calls bookAppointment]

Agent: All set! Your appointment with Dr. Michael Roberts is confirmed for January 20th at 2:00 PM. You'll receive a confirmation email at john@example.com shortly. Is there anything else I can help you with?
```

## Step 6: Testing

### Test Scenarios

1. **Happy Path**: Book available slot
2. **Unavailable Slot**: Request unavailable time
3. **Alternative Times**: Ask for suggestions
4. **Multiple Doctors**: Compare different doctors
5. **Interruptions**: Test conversation interruption handling

### Testing Checklist

- [ ] Agent greets appropriately
- [ ] Agent understands doctor/specialty requests
- [ ] checkAvailability tool is called correctly
- [ ] Agent handles unavailable slots gracefully
- [ ] Patient information is collected completely
- [ ] bookAppointment tool is called with correct data
- [ ] Confirmation message is clear and complete
- [ ] Error handling works properly

## Step 7: Integration with Website

### Get Agent ID

1. In ElevenLabs dashboard, go to your agent
2. Copy the **Agent ID** from the settings
3. Save this for website integration

### Embed Code (for reference)

```html
<script src="https://elevenlabs.io/convai-widget/index.js"></script>
<script>
  window.ElevenLabsConvAI.init({
    agentId: "your-agent-id-here",
    onReady: () => console.log("Agent ready"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error)
  });
</script>
```

## Pricing

**ElevenLabs Conversational AI Pricing** (as of 2026):
- Free tier: 10,000 characters/month
- Creator: $5/month - 30,000 characters
- Pro: $22/month - 100,000 characters
- Scale: $99/month - 500,000 characters

**Estimated Costs**:
- Average booking conversation: ~2,000 characters
- ~$0.10-0.30 per booking conversation

## Troubleshooting

### Agent not calling tools
- Verify webhook URLs are correct and accessible
- Check tool parameter schemas match expected format
- Review system prompt for clear tool usage instructions

### Poor voice quality
- Adjust voice stability and similarity settings
- Try different voice models
- Check internet connection quality

### Conversation feels unnatural
- Refine system prompt for more natural language
- Adjust response latency settings
- Enable interruption handling

## Next Steps

1. Deploy n8n workflows
2. Configure ElevenLabs agent
3. Test thoroughly
4. Integrate with website
5. Monitor and optimize based on real usage

## Support

- ElevenLabs Documentation: [docs.elevenlabs.io](https://docs.elevenlabs.io)
- Community Discord: [elevenlabs.io/discord](https://elevenlabs.io/discord)
- Support Email: support@elevenlabs.io
