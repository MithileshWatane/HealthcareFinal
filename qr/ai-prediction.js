// ============================================
// AI-POWERED HEALTH PREDICTION ENGINE
// Uses Gemini AI for comprehensive analysis
// ============================================
// Note: GEMINI_API_KEY and GEMINI_API_URL are defined in config.js

// Generate comprehensive AI-powered health predictions
async function generateAIPredictions(patientData, lifestyleData, mentalHealthScores, documents) {
    try {
        console.log('Generating AI predictions with comprehensive patient data...');

        // Prepare comprehensive patient profile for AI analysis
        const patientProfile = buildPatientProfile(patientData, lifestyleData, mentalHealthScores, documents);

        // Create the AI prompt
        const prompt = createHealthAnalysisPrompt(patientProfile);

        // Call Gemini AI
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,  // Maximum allowed for Gemini 1.5 Flash
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Parse AI response into structured predictions
        const predictions = parseAIPredictions(aiResponse);

        console.log('AI predictions generated successfully:', predictions);
        return predictions;

    } catch (error) {
        console.error('Error generating AI predictions:', error);
        // Fallback to rule-based predictions
        return generateFallbackPredictions(patientData, lifestyleData, mentalHealthScores);
    }
}

// Build comprehensive patient profile for AI analysis
function buildPatientProfile(patientData, lifestyleData, mentalHealthScores, documents) {
    const age = patientData.dob
        ? Math.floor((new Date() - new Date(patientData.dob)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const bmi = (patientData.weight && patientData.height)
        ? (patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1)
        : null;

    const profile = {
        demographics: {
            age: age,
            gender: patientData.gender,
            bmi: bmi,
            bloodGroup: patientData.blood_group
        },
        medicalHistory: {
            diseases: patientData.diseases || 'None reported',
            allergies: patientData.allergies || 'None reported',
            medications: patientData.medications || 'None',
            surgeries: patientData.surgeries || 'None',
            notes: patientData.notes || 'None'
        },
        lifestyle: lifestyleData?.hasData ? {
            avgSleepHours: lifestyleData.stats.avgSleep,
            avgSteps: lifestyleData.stats.avgSteps,
            avgHydration: lifestyleData.stats.avgHydration,
            avgCalories: lifestyleData.stats.avgCalories,
            sleepProgress: lifestyleData.stats.sleepProgress,
            activityProgress: lifestyleData.stats.stepsProgress
        } : null,
        mentalHealth: mentalHealthScores ? {
            moodStability: mentalHealthScores.mood_stability_index,
            stressResilience: mentalHealthScores.stress_resilience_score,
            burnoutRisk: mentalHealthScores.burnout_risk_score,
            socialConnection: mentalHealthScores.social_connection_index,
            cognitiveFatigue: mentalHealthScores.cognitive_fatigue_score,
            overallWellbeing: mentalHealthScores.overall_wellbeing_score
        } : null,
        documents: documents?.map(doc => ({
            category: doc.category,
            fileName: doc.file_name,
            uploadedAt: doc.uploaded_at,
            description: doc.description
        })) || []
    };

    return profile;
}

// Create comprehensive health analysis prompt for Gemini
function createHealthAnalysisPrompt(profile) {
    return `You are an expert medical AI assistant analyzing patient health data to predict potential health risks and recommend medical tests.

**PATIENT PROFILE:**

Demographics:
- Age: ${profile.demographics.age || 'Unknown'}
- Gender: ${profile.demographics.gender || 'Unknown'}
- BMI: ${profile.demographics.bmi || 'Unknown'}
- Blood Group: ${profile.demographics.bloodGroup || 'Unknown'}

Medical History:
- Known Diseases: ${profile.medicalHistory.diseases}
- Allergies: ${profile.medicalHistory.allergies}
- Current Medications: ${profile.medicalHistory.medications}
- Past Surgeries: ${profile.medicalHistory.surgeries}
- Additional Notes: ${profile.medicalHistory.notes}

${profile.lifestyle ? `
Lifestyle Metrics (30-day average):
- Sleep: ${profile.lifestyle.avgSleepHours} hours/night (${profile.lifestyle.sleepProgress}% of target)
- Physical Activity: ${profile.lifestyle.avgSteps} steps/day (${profile.lifestyle.activityProgress}% of target)
- Hydration: ${profile.lifestyle.avgHydration} cups/day
- Caloric Intake: ${profile.lifestyle.avgCalories} calories/day
` : 'Lifestyle data not available'}

${profile.mentalHealth ? `
Mental Health Scores (0-100 scale):
- Mood Stability: ${profile.mentalHealth.moodStability}
- Stress Resilience: ${profile.mentalHealth.stressResilience}
- Burnout Risk: ${profile.mentalHealth.burnoutRisk}
- Social Connection: ${profile.mentalHealth.socialConnection}
- Cognitive Fatigue: ${profile.mentalHealth.cognitiveFatigue}
- Overall Wellbeing: ${profile.mentalHealth.overallWellbeing}
` : 'Mental health data not available'}

${profile.documents.length > 0 ? `
Medical Documents Available:
${profile.documents.map(doc => `- ${doc.category}: ${doc.fileName}${doc.description ? ` (${doc.description})` : ''}`).join('\n')}
` : 'No medical documents uploaded'}

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

// Parse AI response into structured predictions
function parseAIPredictions(aiResponse) {
    try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonText = aiResponse.trim();

        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText);

        return {
            predictions: parsed.predictions || [],
            testRecommendations: parsed.testRecommendations || [],
            riskAssessments: parsed.riskAssessments || [],
            summary: parsed.summary || 'AI analysis completed'
        };
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.log('Raw AI response:', aiResponse);

        // Try to extract useful information even if JSON parsing fails
        return {
            predictions: [],
            testRecommendations: [],
            riskAssessments: [],
            summary: 'AI analysis completed but response format was unexpected',
            rawResponse: aiResponse
        };
    }
}

// Fallback to rule-based predictions if AI fails
function generateFallbackPredictions(patientData, lifestyleData, mentalHealthScores) {
    console.log('Using fallback rule-based predictions...');

    const age = patientData.dob
        ? Math.floor((new Date() - new Date(patientData.dob)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const bmi = (patientData.weight && patientData.height)
        ? (patientData.weight / Math.pow(patientData.height / 100, 2))
        : null;

    const predictions = [];
    const testRecommendations = [];
    const riskAssessments = [];

    // Basic cardiovascular risk
    if (age && bmi && age >= 40) {
        const cardioRisk = calculateCardiovascularRisk(
            age, bmi,
            patientData.diseases?.toLowerCase().includes('hypertension') || false,
            patientData.diseases?.toLowerCase().includes('diabetes') || false,
            lifestyleData, mentalHealthScores
        );

        if (cardioRisk.score >= 40) {
            predictions.push({
                condition_name: 'Cardiovascular Disease Risk',
                risk_score: cardioRisk.score,
                risk_level: getRiskLevel(cardioRisk.score),
                description: 'Based on age, BMI, and lifestyle factors',
                recommendations: cardioRisk.recommendations,
                contributing_factors: cardioRisk.factors
            });
        }

        riskAssessments.push({
            assessment_type: 'cardiovascular',
            overall_risk_score: cardioRisk.score,
            risk_level: getRiskLevel(cardioRisk.score),
            trend_direction: 'unknown',
            recommendations: cardioRisk.recommendations
        });
    }

    // Age-based test recommendations
    if (age) {
        testRecommendations.push(...generateAgeBasedTests(age, patientData.gender));
    }

    return {
        predictions,
        testRecommendations,
        riskAssessments,
        summary: 'Basic health risk assessment completed using rule-based analysis'
    };
}
