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


        // Get current time in IST (UTC+5:30) and calculate time 2 minutes from now
        const now = new Date();
        // Convert to IST by adding 5 hours 30 minutes
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const istNow = new Date(now.getTime() + istOffset);
        const twoMinutesFromNow = new Date(istNow.getTime() + 2 * 60 * 1000);

        // Format time for comparison (HH:MM format)
        const targetHour = twoMinutesFromNow.getUTCHours();
        const targetMinute = twoMinutesFromNow.getUTCMinutes();
        const targetPeriod = targetHour >= 12 ? "PM" : "AM";
        const displayHour = targetHour % 12 || 12;
        const targetTime = `${displayHour}:${targetMinute.toString().padStart(2, '0')}`;

        console.log(`Current IST time: ${istNow.toISOString()}`);
        console.log(`Checking for medications at ${targetTime} ${targetPeriod}`);

        // First, let's see all tasks with whatsapp enabled for debugging
        const { data: allTasks, error: debugError } = await supabaseClient
            .from("tasks")
            .select("*")
            .eq("whatsapp_enabled", true);

        console.log(`Total WhatsApp-enabled tasks in DB: ${allTasks?.length || 0}`);
        if (allTasks && allTasks.length > 0) {
            console.log("WhatsApp-enabled tasks:", JSON.stringify(allTasks.map(t => ({
                id: t.id,
                title: t.title,
                time: t.time,
                time_period: t.time_period,
                status: t.status,
                notification_sent: t.notification_sent,
                phone_number: t.phone_number
            }))));
        }

        // Query tasks that need notifications
        const { data: tasks, error: queryError } = await supabaseClient
            .from("tasks")
            .select("*")
            .eq("whatsapp_enabled", true)
            .eq("notification_sent", false)
            .eq("time", targetTime)
            .eq("time_period", targetPeriod)
            .in("status", ["to_complete", "in_progress"])
            .not("phone_number", "is", null);

        if (queryError) {
            console.error("Error querying tasks:", queryError);
            return new Response(
                JSON.stringify({ error: queryError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Found ${tasks?.length || 0} tasks to notify`);

        if (!tasks || tasks.length === 0) {
            return new Response(
                JSON.stringify({ message: "No tasks to notify", count: 0 }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Send notifications for each task
        const results = [];
        const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

        if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
            console.error("Twilio credentials not configured");
            return new Response(
                JSON.stringify({ error: "Twilio credentials not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        for (const task of tasks) {
            try {
                // Format WhatsApp message
                const message = task.description
                    ? `🔔 Medication Reminder\n\nTime to take: ${task.title}\nDosage: ${task.description}\n\nPlease take your medication as prescribed.`
                    : `🔔 Medication Reminder\n\nTime to take: ${task.title}\n\nPlease take your medication as prescribed.`;

                // Send WhatsApp message via Twilio
                const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
                const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

                const formData = new URLSearchParams();
                formData.append("From", twilioWhatsAppNumber);
                formData.append("To", task.phone_number.startsWith("whatsapp:") ? task.phone_number : `whatsapp:${task.phone_number}`);
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
                    console.error(`Twilio error for task ${task.id}:`, errorData);
                    results.push({
                        taskId: task.id,
                        taskTitle: task.title,
                        success: false,
                        error: `Twilio error: ${errorData}`,
                    });
                    continue;
                }

                const twilioData = await twilioResponse.json();

                // Update task to mark notification as sent
                const { error: updateError } = await supabaseClient
                    .from("tasks")
                    .update({
                        notification_sent: true,
                        last_notification_at: new Date().toISOString(),
                    })
                    .eq("id", task.id);

                if (updateError) {
                    console.error(`Error updating task ${task.id}:`, updateError);
                }

                results.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    success: true,
                    messageSid: twilioData.sid,
                });

                console.log(`✅ Sent WhatsApp notification for: ${task.title}`);
            } catch (error: any) {
                console.error(`Error sending notification for task ${task.id}:`, error);
                results.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    success: false,
                    error: error.message,
                });
            }
        }

        return new Response(
            JSON.stringify({
                message: "Notification check completed",
                count: tasks.length,
                results,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
