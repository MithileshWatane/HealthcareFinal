// ============================================
// PREDICTION API FUNCTIONS - Data Fetching from Supabase
// ============================================

// Fetch health predictions for a patient
async function fetchHealthPredictions(patientId) {
    try {
        const { data, error } = await supabaseClient
            .from('health_predictions')
            .select('*')
            .eq('user_id', patientId)
            .eq('is_active', true)
            .order('risk_score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching health predictions:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Error in fetchHealthPredictions:', err);
        return [];
    }
}

// Fetch medical test recommendations for a patient
async function fetchTestRecommendations(patientId) {
    try {
        const { data, error } = await supabaseClient
            .from('medical_test_recommendations')
            .select('*')
            .eq('user_id', patientId)
            .eq('is_completed', false)
            .order('priority_level', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching test recommendations:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Error in fetchTestRecommendations:', err);
        return [];
    }
}

// Fetch health risk assessments for a patient
async function fetchRiskAssessments(patientId) {
    try {
        const { data, error } = await supabaseClient
            .from('health_risk_assessments')
            .select('*')
            .eq('user_id', patientId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching risk assessments:', error);
            return null;
        }
        return data && data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error('Error in fetchRiskAssessments:', err);
        return null;
    }
}

// Fetch all risk assessments by type
async function fetchRiskAssessmentsByType(patientId) {
    try {
        const { data, error } = await supabaseClient
            .from('health_risk_assessments')
            .select('*')
            .eq('user_id', patientId)
            .order('assessment_type')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching risk assessments by type:', error);
            return [];
        }

        // Get the latest assessment for each type
        const latestByType = {};
        (data || []).forEach(assessment => {
            if (!latestByType[assessment.assessment_type]) {
                latestByType[assessment.assessment_type] = assessment;
            }
        });

        return Object.values(latestByType);
    } catch (err) {
        console.error('Error in fetchRiskAssessmentsByType:', err);
        return [];
    }
}

// Generate predictions for a patient (client-side calculation)
async function generatePredictions(patientData, lifestyleData, mentalHealthScores) {
    const predictions = [];
    const testRecommendations = [];
    const riskAssessments = [];

    try {
        const age = patientData.dob
            ? Math.floor((new Date() - new Date(patientData.dob)) / (365.25 * 24 * 60 * 60 * 1000))
            : null;
        const bmi = (patientData.weight && patientData.height)
            ? (patientData.weight / Math.pow(patientData.height / 100, 2))
            : null;

        // Calculate cardiovascular risk
        if (age && bmi) {
            const cardioRisk = calculateCardiovascularRisk(
                age,
                bmi,
                patientData.diseases?.toLowerCase().includes('hypertension') || false,
                patientData.diseases?.toLowerCase().includes('diabetes') || false,
                lifestyleData,
                mentalHealthScores
            );

            riskAssessments.push({
                assessment_type: 'cardiovascular',
                overall_risk_score: cardioRisk.score,
                risk_level: getRiskLevel(cardioRisk.score),
                risk_factors: cardioRisk.factors,
                recommendations: cardioRisk.recommendations,
                trend_direction: cardioRisk.trend
            });

            if (cardioRisk.score >= 50) {
                predictions.push({
                    prediction_type: 'condition_risk',
                    condition_name: 'Cardiovascular Disease',
                    risk_score: cardioRisk.score,
                    risk_level: getRiskLevel(cardioRisk.score),
                    description: `Based on your age, BMI, and lifestyle factors, you have a ${getRiskLevel(cardioRisk.score)} risk for cardiovascular disease.`,
                    recommendations: cardioRisk.recommendations,
                    contributing_factors: cardioRisk.factors
                });
            }
        }

        // Calculate diabetes risk
        if (age && bmi) {
            const diabetesRisk = calculateDiabetesRisk(age, bmi, patientData, lifestyleData);

            riskAssessments.push({
                assessment_type: 'diabetes',
                overall_risk_score: diabetesRisk.score,
                risk_level: getRiskLevel(diabetesRisk.score),
                risk_factors: diabetesRisk.factors,
                recommendations: diabetesRisk.recommendations,
                trend_direction: diabetesRisk.trend
            });

            if (diabetesRisk.score >= 40) {
                predictions.push({
                    prediction_type: 'condition_risk',
                    condition_name: 'Type 2 Diabetes',
                    risk_score: diabetesRisk.score,
                    risk_level: getRiskLevel(diabetesRisk.score),
                    description: `Your BMI and lifestyle patterns indicate a ${getRiskLevel(diabetesRisk.score)} risk for developing Type 2 Diabetes.`,
                    recommendations: diabetesRisk.recommendations,
                    contributing_factors: diabetesRisk.factors
                });
            }
        }

        // Mental health risk assessment
        if (mentalHealthScores) {
            const mentalRisk = assessMentalHealthRisk(mentalHealthScores);

            riskAssessments.push({
                assessment_type: 'mental_health',
                overall_risk_score: mentalRisk.score,
                risk_level: getRiskLevel(mentalRisk.score),
                risk_factors: mentalRisk.factors,
                recommendations: mentalRisk.recommendations,
                trend_direction: 'unknown'
            });

            if (mentalRisk.score >= 60) {
                predictions.push({
                    prediction_type: 'mental_health_alert',
                    condition_name: 'Mental Health Concern',
                    risk_score: mentalRisk.score,
                    risk_level: getRiskLevel(mentalRisk.score),
                    description: mentalRisk.description,
                    recommendations: mentalRisk.recommendations,
                    contributing_factors: mentalRisk.factors
                });
            }
        }

        // Sleep disorder risk
        if (lifestyleData?.hasData && lifestyleData.stats) {
            const sleepRisk = assessSleepDisorderRisk(lifestyleData);

            if (sleepRisk.score >= 50) {
                predictions.push({
                    prediction_type: 'lifestyle_concern',
                    condition_name: 'Sleep Disorder',
                    risk_score: sleepRisk.score,
                    risk_level: getRiskLevel(sleepRisk.score),
                    description: sleepRisk.description,
                    recommendations: sleepRisk.recommendations,
                    contributing_factors: sleepRisk.factors
                });
            }
        }

        // Generate test recommendations based on age
        if (age) {
            testRecommendations.push(...generateAgeBasedTests(age, patientData.gender));
        }

        // Generate condition-based test recommendations
        if (patientData.diseases) {
            testRecommendations.push(...generateConditionBasedTests(patientData.diseases));
        }

        // Generate lifestyle-based test recommendations
        if (lifestyleData?.hasData) {
            testRecommendations.push(...generateLifestyleBasedTests(lifestyleData, bmi));
        }

        return {
            predictions,
            testRecommendations,
            riskAssessments
        };
    } catch (err) {
        console.error('Error generating predictions:', err);
        return {
            predictions: [],
            testRecommendations: [],
            riskAssessments: []
        };
    }
}
