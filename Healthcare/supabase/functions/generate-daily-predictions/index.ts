import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface PatientData {
    id: string;
    full_name: string;
    dob: string;
    gender: string;
    blood_group: string;
    height: number;
    weight: number;
    diseases: string;
    allergies: string;
    medications: string;
    surgeries: string;
    notes: string;
    phone: string;
    emergency_contact: string;
}

interface LifestyleStats {
    avgSleep: number;
    avgSteps: number;
    avgHydration: number;
    avgCalories: number;
    sleepProgress: number;
    stepsProgress: number;
}

interface MentalHealthScores {
    mood_stability_index: number;
    stress_resilience_score: number;
    burnout_risk_score: number;
    social_connection_index: number;
    cognitive_fatigue_score: number;
    overall_wellbeing_score: number;
}

serve(async (req) => {
    try {
        // Initialize Supabase client with service role key for admin access
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        console.log("Starting daily health prediction generation...");

        // Fetch all active users from patients table
        const { data: patients, error: patientsError } = await supabase
            .from("patients")
            .select("*");

        if (patientsError) {
            throw new Error(`Failed to fetch patients: ${patientsError.message}`);
        }

        console.log(`Found ${patients?.length || 0} patients to process`);

        const results = {
            total: patients?.length || 0,
            successful: 0,
            failed: 0,
            errors: [] as Array<{ userId: string; error: string }>,
        };

        // Process each patient
        for (const patient of patients || []) {
            try {
                console.log(`Processing patient: ${patient.id}`);

                // Fetch lifestyle data
                const lifestyleData = await fetchLifestyleData(supabase, patient.id);

                // Fetch mental health scores
                const { data: mentalHealthScores } = await supabase
                    .from("mental_health_scores")
                    .select("*")
                    .eq("user_id", patient.id)
                    .order("calculated_at", { ascending: false })
                    .limit(1)
                    .single();

                // Fetch documents
                const { data: documents } = await supabase
                    .from("patient_documents")
                    .select("*")
                    .eq("patient_id", patient.id)
                    .order("uploaded_at", { ascending: false });

                // Generate AI predictions
                const predictions = await generateAIPredictions(
                    patient,
                    lifestyleData,
                    mentalHealthScores,
                    documents || []
                );

                // Store predictions in database
                await storePredictions(supabase, patient.id, predictions);

                results.successful++;
                console.log(`Successfully processed patient: ${patient.id}`);
            } catch (error) {
                results.failed++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.errors.push({ userId: patient.id, error: errorMessage });
                console.error(`Failed to process patient ${patient.id}:`, errorMessage);
            }
        }

        console.log("Daily prediction generation completed:", results);

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error in daily prediction generation:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
            { headers: { "Content-Type": "application/json" }, status: 500 }
        );
    }
});

async function fetchLifestyleData(supabase: any, userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch sleep data
    const { data: sleepData } = await supabase
        .from("lifestyle_sleep_entries")
        .select("duration_hours")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    // Fetch activity data
    const { data: activityData } = await supabase
        .from("lifestyle_activity_entries")
        .select("steps")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    // Fetch hydration data
    const { data: hydrationData } = await supabase
        .from("lifestyle_hydration_entries")
        .select("cups_consumed")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    // Fetch nutrition data
    const { data: nutritionData } = await supabase
        .from("lifestyle_nutrition_entries")
        .select("calories")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    if (!sleepData?.length && !activityData?.length) {
        return null;
    }

    const avgSleep = sleepData?.length
        ? sleepData.reduce((sum: number, entry: any) => sum + (entry.duration_hours || 0), 0) / sleepData.length
        : 0;

    const avgSteps = activityData?.length
        ? activityData.reduce((sum: number, entry: any) => sum + (entry.steps || 0), 0) / activityData.length
        : 0;

    const avgHydration = hydrationData?.length
        ? hydrationData.reduce((sum: number, entry: any) => sum + (entry.cups_consumed || 0), 0) / hydrationData.length
        : 0;

    const avgCalories = nutritionData?.length
        ? nutritionData.reduce((sum: number, entry: any) => sum + (entry.calories || 0), 0) / nutritionData.length
        : 0;

    return {
        hasData: true,
        stats: {
            avgSleep: Number(avgSleep.toFixed(1)),
            avgSteps: Math.round(avgSteps),
            avgHydration: Number(avgHydration.toFixed(1)),
            avgCalories: Math.round(avgCalories),
            sleepProgress: Math.round((avgSleep / 8) * 100),
            stepsProgress: Math.round((avgSteps / 10000) * 100),
        },
    };
}

async function generateAIPredictions(
    patientData: PatientData,
    lifestyleData: any,
    mentalHealthScores: any,
    documents: any[]
) {
    const age = patientData.dob
        ? Math.floor((new Date().getTime() - new Date(patientData.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const bmi =
        patientData.weight && patientData.height
            ? (patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1)
            : null;

    const profile = {
        demographics: {
            age: age,
            gender: patientData.gender,
            bmi: bmi,
            bloodGroup: patientData.blood_group,
        },
        medicalHistory: {
            diseases: patientData.diseases || "None reported",
            allergies: patientData.allergies || "None reported",
            medications: patientData.medications || "None",
            surgeries: patientData.surgeries || "None",
            notes: patientData.notes || "None",
        },
        lifestyle: lifestyleData?.hasData
            ? {
                avgSleepHours: lifestyleData.stats.avgSleep,
                avgSteps: lifestyleData.stats.avgSteps,
                avgHydration: lifestyleData.stats.avgHydration,
                avgCalories: lifestyleData.stats.avgCalories,
                sleepProgress: lifestyleData.stats.sleepProgress,
                activityProgress: lifestyleData.stats.stepsProgress,
            }
            : null,
        mentalHealth: mentalHealthScores
            ? {
                moodStability: mentalHealthScores.mood_stability_index,
                stressResilience: mentalHealthScores.stress_resilience_score,
                burnoutRisk: mentalHealthScores.burnout_risk_score,
                socialConnection: mentalHealthScores.social_connection_index,
                cognitiveFatigue: mentalHealthScores.cognitive_fatigue_score,
                overallWellbeing: mentalHealthScores.overall_wellbeing_score,
            }
            : null,
        documents: documents.map((doc) => ({
            category: doc.category,
            fileName: doc.file_name,
            uploadedAt: doc.uploaded_at,
            description: doc.description,
        })),
    };

    const prompt = createHealthAnalysisPrompt(profile);

    // Call Gemini AI
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Parse AI response
    let jsonText = aiResponse.trim();
    if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonText);

    return {
        predictions: parsed.predictions || [],
        testRecommendations: parsed.testRecommendations || [],
        riskAssessments: parsed.riskAssessments || [],
        summary: parsed.summary || "AI analysis completed",
    };
}

function createHealthAnalysisPrompt(profile: any): string {
    return `You are an expert medical AI assistant analyzing patient health data to predict potential health risks and recommend medical tests.

**PATIENT PROFILE:**

Demographics:
- Age: ${profile.demographics.age || "Unknown"}
- Gender: ${profile.demographics.gender || "Unknown"}
- BMI: ${profile.demographics.bmi || "Unknown"}
- Blood Group: ${profile.demographics.bloodGroup || "Unknown"}

Medical History:
- Known Diseases: ${profile.medicalHistory.diseases}
- Allergies: ${profile.medicalHistory.allergies}
- Current Medications: ${profile.medicalHistory.medications}
- Past Surgeries: ${profile.medicalHistory.surgeries}
- Additional Notes: ${profile.medicalHistory.notes}

${profile.lifestyle
            ? `
Lifestyle Metrics (30-day average):
- Sleep: ${profile.lifestyle.avgSleepHours} hours/night (${profile.lifestyle.sleepProgress}% of target)
- Physical Activity: ${profile.lifestyle.avgSteps} steps/day (${profile.lifestyle.activityProgress}% of target)
- Hydration: ${profile.lifestyle.avgHydration} cups/day
- Caloric Intake: ${profile.lifestyle.avgCalories} calories/day
`
            : "Lifestyle data not available"
        }

${profile.mentalHealth
            ? `
Mental Health Scores (0-100 scale):
- Mood Stability: ${profile.mentalHealth.moodStability}
- Stress Resilience: ${profile.mentalHealth.stressResilience}
- Burnout Risk: ${profile.mentalHealth.burnoutRisk}
- Social Connection: ${profile.mentalHealth.socialConnection}
- Cognitive Fatigue: ${profile.mentalHealth.cognitiveFatigue}
- Overall Wellbeing: ${profile.mentalHealth.overallWellbeing}
`
            : "Mental health data not available"
        }

${profile.documents.length > 0
            ? `
Medical Documents Available:
${profile.documents.map((doc: any) => `- ${doc.category}: ${doc.fileName}${doc.description ? ` (${doc.description})` : ""}`).join("\n")}
`
            : "No medical documents uploaded"
        }

**TASK:**
Based on this comprehensive patient data, provide:

1. **Health Risk Predictions** (up to 5 most significant):
   - Identify potential health conditions or risks
   - Assign risk score (0-100) and level (low/moderate/high/critical)
   - Explain contributing factors
   - Provide specific recommendations

2. **Recommended Medical Tests** (prioritized list):
   - Test name and category
   - Priority level (low/medium/high/urgent)
   - Reason for recommendation
   - Recommended frequency

3. **Risk Assessments** (for major categories):
   - Cardiovascular risk
   - Diabetes risk
   - Mental health risk
   - Sleep disorder risk
   - Overall health trend (improving/stable/declining)

**OUTPUT FORMAT (JSON):**
\`\`\`json
{
  "predictions": [
    {
      "condition_name": "string",
      "risk_score": number,
      "risk_level": "low|moderate|high|critical",
      "description": "string",
      "recommendations": ["string"],
      "contributing_factors": {"factor": "description"}
    }
  ],
  "testRecommendations": [
    {
      "test_name": "string",
      "test_category": "routine_screening|diagnostic|preventive|follow_up",
      "priority_level": "low|medium|high|urgent",
      "reason": "string",
      "recommended_frequency": "string"
    }
  ],
  "riskAssessments": [
    {
      "assessment_type": "cardiovascular|diabetes|mental_health|sleep_disorder",
      "overall_risk_score": number,
      "risk_level": "low|moderate|high|critical",
      "trend_direction": "improving|stable|declining|unknown",
      "recommendations": ["string"]
    }
  ],
  "summary": "Brief overall health assessment and key insights"
}
\`\`\`

Provide ONLY the JSON output, no additional text.`;
}

async function storePredictions(supabase: any, userId: string, predictions: any) {
    // Deactivate old predictions
    await supabase
        .from("health_predictions")
        .update({ is_active: false })
        .eq("user_id", userId);

    // Insert new predictions
    if (predictions.predictions.length > 0) {
        const predictionRecords = predictions.predictions.map((pred: any) => ({
            user_id: userId,
            prediction_type: "condition_risk",
            condition_name: pred.condition_name,
            risk_score: pred.risk_score,
            risk_level: pred.risk_level,
            description: pred.description,
            recommendations: pred.recommendations,
            contributing_factors: pred.contributing_factors,
            is_active: true,
        }));

        await supabase.from("health_predictions").insert(predictionRecords);
    }

    // Delete old test recommendations and insert new ones
    await supabase
        .from("medical_test_recommendations")
        .delete()
        .eq("user_id", userId)
        .eq("is_completed", false);

    if (predictions.testRecommendations.length > 0) {
        const testRecords = predictions.testRecommendations.map((test: any) => ({
            user_id: userId,
            test_name: test.test_name,
            test_category: test.test_category,
            priority_level: test.priority_level,
            reason: test.reason,
            recommended_frequency: test.recommended_frequency,
            is_completed: false,
        }));

        await supabase.from("medical_test_recommendations").insert(testRecords);
    }

    // Insert risk assessments
    if (predictions.riskAssessments.length > 0) {
        const riskRecords = predictions.riskAssessments.map((risk: any) => ({
            user_id: userId,
            assessment_type: risk.assessment_type,
            overall_risk_score: risk.overall_risk_score,
            risk_level: risk.risk_level,
            risk_factors: {},
            trend_direction: risk.trend_direction,
            recommendations: risk.recommendations,
        }));

        await supabase.from("health_risk_assessments").insert(riskRecords);
    }
}
