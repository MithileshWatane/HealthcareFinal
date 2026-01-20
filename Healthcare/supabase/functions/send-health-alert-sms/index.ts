import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface AlertData {
  user_id: string;
  alert_type: string;
  data: any;
}

serve(async (req) => {
  try {
    const { user_id, alert_type, data }: AlertData = await req.json();

    console.log(`Processing health alert for user: ${user_id}, type: ${alert_type}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch patient phone and name
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("phone, full_name")
      .eq("id", user_id)
      .single();

    if (patientError || !patient) {
      throw new Error(`Failed to fetch patient: ${patientError?.message}`);
    }

    const phone = patient.phone;

    if (!phone) {
      console.log(`No phone for user ${user_id}, skipping notification`);
      return new Response(
        JSON.stringify({ success: false, reason: "No phone number" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Format WhatsApp message based on alert type
    const message = formatWhatsAppMessage(alert_type, data, patient.full_name);

    // Send WhatsApp via Twilio
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    // Format phone number for WhatsApp (phone should already have +91 in database)
    const whatsappNumber = `whatsapp:${phone}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
      To: whatsappNumber,
      From: TWILIO_WHATSAPP_NUMBER!,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio WhatsApp API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`WhatsApp sent successfully to ${phone}`, result);

    return new Response(
      JSON.stringify({
        success: true,
        phone: phone,
        messageSid: result.sid,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error sending health alert:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function formatWhatsAppMessage(alertType: string, data: any, patientName: string): string {
  if (alertType === "health_predictions") {
    // Critical health prediction alert
    const recommendations = data.recommendations && data.recommendations.length > 0
      ? data.recommendations.slice(0, 3).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
      : '• Consult your healthcare provider immediately';

    return `🚨 *CRITICAL HEALTH ALERT*

Dear ${patientName},

⚠️ *Critical Risk Detected*
Condition: *${data.condition_name}*
Risk Level: *${data.risk_level.toUpperCase()}*
${data.risk_score ? `Risk Score: ${data.risk_score}/100` : ''}

${data.description ? `\n📋 ${data.description}\n` : ''}

*Recommended Actions:*
${recommendations}

*Next Steps:*
1. Review full details in your health dashboard
2. Consult with your healthcare provider
3. Follow the recommended actions above

_This is an automated health alert from your Healthcare System._`;
  } else if (alertType === "medical_test_recommendations") {
    // Urgent medical test alert
    return `⚕️ *URGENT MEDICAL TEST REQUIRED*

Dear ${patientName},

*Test Name:* ${data.test_name}
*Priority:* ${data.priority_level ? data.priority_level.toUpperCase() : 'HIGH'}
${data.test_category ? `*Category:* ${data.test_category}` : ''}

${data.reason ? `\n*Reason:*\n${data.reason}\n` : ''}
${data.recommended_frequency ? `*Frequency:* ${data.recommended_frequency}\n` : ''}

⚠️ *Action Required:*
Please schedule this test as soon as possible. Contact your healthcare provider to book an appointment.

_This is an automated health alert from your Healthcare System._`;
  }

  // Fallback
  return `🏥 *Health Alert*\n\nDear ${patientName},\n\nYou have a new health alert. Please check your health dashboard for details.`;
}
