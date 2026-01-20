import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { taskId, medicineName, dosage, phoneNumber } = await req.json();

        // Validate required fields
        if (!taskId || !medicineName || !phoneNumber) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get Twilio credentials from environment
        const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

        if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
            return new Response(
                JSON.stringify({ error: "Twilio credentials not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Format WhatsApp message
        const message = dosage
            ? `🔔 Medication Reminder\n\nTime to take: ${medicineName}\nDosage: ${dosage}\n\nPlease take your medication as prescribed.`
            : `🔔 Medication Reminder\n\nTime to take: ${medicineName}\n\nPlease take your medication as prescribed.`;

        // Send WhatsApp message via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

        const formData = new URLSearchParams();
        formData.append("From", twilioWhatsAppNumber);
        formData.append("To", phoneNumber.startsWith("whatsapp:") ? phoneNumber : `whatsapp:${phoneNumber}`);
        formData.append("Body", message);

        const twilioResponse = await fetch(twilioUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${twilioAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        if (!twilioResponse.ok) {
            const errorData = await twilioResponse.text();
            console.error("Twilio error:", errorData);
            return new Response(
                JSON.stringify({ error: "Failed to send WhatsApp message", details: errorData }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const twilioData = await twilioResponse.json();

        // Update task to mark notification as sent
        const { error: updateError } = await supabaseClient
            .from("tasks")
            .update({
                notification_sent: true,
                last_notification_at: new Date().toISOString(),
            })
            .eq("id", taskId);

        if (updateError) {
            console.error("Error updating task:", updateError);
        }

        return new Response(
            JSON.stringify({
                success: true,
                messageSid: twilioData.sid,
                message: "WhatsApp notification sent successfully",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
