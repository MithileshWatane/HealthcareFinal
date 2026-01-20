// ============================================
// HEALTH PREDICTION ENGINE
// Core prediction logic and risk calculations
// ============================================

// Calculate cardiovascular risk score
function calculateCardiovascularRisk(age, bmi, hasHypertension, hasDiabetes, lifestyleData, mentalHealthScores) {
    let riskScore = 0;
    const factors = {};
    const recommendations = [];

    // Age factor (increases with age)
    if (age >= 65) {
        riskScore += 30;
        factors.age = { value: age, impact: 'high', description: 'Age 65+ significantly increases cardiovascular risk' };
    } else if (age >= 50) {
        riskScore += 20;
        factors.age = { value: age, impact: 'moderate', description: 'Age 50+ moderately increases risk' };
    } else if (age >= 40) {
        riskScore += 10;
        factors.age = { value: age, impact: 'low', description: 'Age 40+ slightly increases risk' };
    }

    // BMI factor
    if (bmi > 30) {
        riskScore += 25;
        factors.bmi = { value: bmi.toFixed(1), impact: 'high', description: 'Obesity (BMI > 30) is a major risk factor' };
        recommendations.push('Weight management through diet and exercise');
    } else if (bmi > 25) {
        riskScore += 15;
        factors.bmi = { value: bmi.toFixed(1), impact: 'moderate', description: 'Overweight (BMI 25-30) increases risk' };
        recommendations.push('Maintain healthy weight through balanced diet');
    }

    // Existing conditions
    if (hasHypertension) {
        riskScore += 20;
        factors.hypertension = { value: true, impact: 'high', description: 'Hypertension is a major cardiovascular risk factor' };
        recommendations.push('Regular blood pressure monitoring');
    }

    if (hasDiabetes) {
        riskScore += 15;
        factors.diabetes = { value: true, impact: 'high', description: 'Diabetes increases cardiovascular risk' };
        recommendations.push('Maintain blood sugar control');
    }

    // Lifestyle factors
    if (lifestyleData?.hasData && lifestyleData.stats) {
        const avgSleep = lifestyleData.stats.avgSleep;
        const avgSteps = lifestyleData.stats.avgSteps;

        // Sleep quality
        if (avgSleep < 6) {
            riskScore += 10;
            factors.sleep = { value: `${avgSleep} hrs`, impact: 'moderate', description: 'Poor sleep (<6 hrs) increases risk' };
            recommendations.push('Improve sleep quality - aim for 7-9 hours');
        } else if (avgSleep < 7) {
            riskScore += 5;
            factors.sleep = { value: `${avgSleep} hrs`, impact: 'low', description: 'Suboptimal sleep duration' };
        }

        // Physical activity
        if (avgSteps < 5000) {
            riskScore += 15;
            factors.activity = { value: `${avgSteps} steps`, impact: 'high', description: 'Sedentary lifestyle (<5000 steps)' };
            recommendations.push('Increase physical activity - aim for 10,000 steps daily');
        } else if (avgSteps < 7500) {
            riskScore += 8;
            factors.activity = { value: `${avgSteps} steps`, impact: 'moderate', description: 'Low activity level' };
            recommendations.push('Gradually increase daily physical activity');
        }
    }

    // Mental health stress factor
    if (mentalHealthScores) {
        const stressScore = mentalHealthScores.stress_resilience_score;
        if (stressScore !== null && stressScore < 40) {
            riskScore += 10;
            factors.stress = { value: stressScore, impact: 'moderate', description: 'High stress levels affect heart health' };
            recommendations.push('Stress management through relaxation techniques');
        }
    }

    // Add general recommendations
    if (riskScore >= 50) {
        recommendations.unshift('Consult with a cardiologist for comprehensive evaluation');
        recommendations.push('Consider cardiac stress test and lipid panel');
    }

    return {
        score: Math.min(100, Math.max(0, riskScore)),
        factors,
        recommendations,
        trend: 'unknown' // Would need historical data to determine trend
    };
}

// Calculate diabetes risk score
function calculateDiabetesRisk(age, bmi, patientData, lifestyleData) {
    let riskScore = 0;
    const factors = {};
    const recommendations = [];

    // Age factor
    if (age > 45) {
        riskScore += 20;
        factors.age = { value: age, impact: 'high', description: 'Age >45 increases diabetes risk' };
    } else if (age > 35) {
        riskScore += 10;
        factors.age = { value: age, impact: 'moderate', description: 'Age >35 moderately increases risk' };
    }

    // BMI factor (strongest predictor)
    if (bmi > 30) {
        riskScore += 35;
        factors.bmi = { value: bmi.toFixed(1), impact: 'critical', description: 'Obesity is the strongest diabetes risk factor' };
        recommendations.push('Weight loss is critical - consult nutritionist');
    } else if (bmi > 25) {
        riskScore += 20;
        factors.bmi = { value: bmi.toFixed(1), impact: 'high', description: 'Overweight significantly increases risk' };
        recommendations.push('Achieve healthy weight through diet and exercise');
    }

    // Family history (check in diseases field)
    const hasFamilyHistory = patientData.diseases?.toLowerCase().includes('family history') ||
        patientData.diseases?.toLowerCase().includes('diabetes');
    if (hasFamilyHistory) {
        riskScore += 15;
        factors.familyHistory = { value: true, impact: 'high', description: 'Family history of diabetes' };
    }

    // Lifestyle factors
    if (lifestyleData?.hasData && lifestyleData.stats) {
        const avgCalories = lifestyleData.stats.avgCalories;
        const avgSteps = lifestyleData.stats.avgSteps;

        // Nutrition patterns
        if (avgCalories > 2500) {
            riskScore += 10;
            factors.nutrition = { value: `${avgCalories} cal`, impact: 'moderate', description: 'High caloric intake' };
            recommendations.push('Reduce caloric intake and focus on balanced diet');
        }

        // Physical activity
        if (avgSteps < 5000) {
            riskScore += 15;
            factors.activity = { value: `${avgSteps} steps`, impact: 'high', description: 'Sedentary lifestyle' };
            recommendations.push('Increase physical activity to improve insulin sensitivity');
        }
    }

    // Add general recommendations
    if (riskScore >= 60) {
        recommendations.unshift('Urgent: Schedule HbA1c and fasting glucose test');
        recommendations.push('Consult with endocrinologist');
    } else if (riskScore >= 40) {
        recommendations.unshift('Schedule blood glucose screening');
    }

    return {
        score: Math.min(100, Math.max(0, riskScore)),
        factors,
        recommendations,
        trend: 'unknown'
    };
}

// Assess mental health risk
function assessMentalHealthRisk(mentalHealthScores) {
    let riskScore = 0;
    const factors = {};
    const recommendations = [];

    // Burnout risk
    if (mentalHealthScores.burnout_risk_score >= 70) {
        riskScore += 30;
        factors.burnout = { value: mentalHealthScores.burnout_risk_score, impact: 'critical', description: 'High burnout risk' };
        recommendations.push('Seek professional mental health support immediately');
    } else if (mentalHealthScores.burnout_risk_score >= 50) {
        riskScore += 20;
        factors.burnout = { value: mentalHealthScores.burnout_risk_score, impact: 'high', description: 'Elevated burnout risk' };
        recommendations.push('Consider counseling or therapy');
    }

    // Mood stability
    if (mentalHealthScores.mood_stability_index < 40) {
        riskScore += 25;
        factors.moodStability = { value: mentalHealthScores.mood_stability_index, impact: 'high', description: 'Poor mood stability' };
        recommendations.push('Practice mood regulation techniques');
    }

    // Stress resilience
    if (mentalHealthScores.stress_resilience_score < 40) {
        riskScore += 20;
        factors.stress = { value: mentalHealthScores.stress_resilience_score, impact: 'high', description: 'Low stress resilience' };
        recommendations.push('Learn stress management strategies');
    }

    // Social connection
    if (mentalHealthScores.social_connection_index < 40) {
        riskScore += 15;
        factors.socialConnection = { value: mentalHealthScores.social_connection_index, impact: 'moderate', description: 'Low social connection' };
        recommendations.push('Increase social interactions and support network');
    }

    // Cognitive fatigue
    if (mentalHealthScores.cognitive_fatigue_score >= 60) {
        riskScore += 10;
        factors.cognitiveFatigue = { value: mentalHealthScores.cognitive_fatigue_score, impact: 'moderate', description: 'High cognitive fatigue' };
        recommendations.push('Take regular breaks and practice mindfulness');
    }

    const description = riskScore >= 70
        ? 'Your mental health scores indicate significant concerns that require immediate attention.'
        : riskScore >= 50
            ? 'Your mental health indicators show elevated stress and burnout risk.'
            : 'Some mental health indicators need attention for optimal wellbeing.';

    return {
        score: Math.min(100, Math.max(0, riskScore)),
        factors,
        recommendations,
        description
    };
}

// Assess sleep disorder risk
function assessSleepDisorderRisk(lifestyleData) {
    let riskScore = 0;
    const factors = {};
    const recommendations = [];

    const avgSleep = lifestyleData.stats.avgSleep;

    if (avgSleep < 5) {
        riskScore += 60;
        factors.duration = { value: `${avgSleep} hrs`, impact: 'critical', description: 'Severe sleep deprivation' };
        recommendations.push('Urgent: Consult sleep specialist for evaluation');
        recommendations.push('Consider sleep study for sleep apnea screening');
    } else if (avgSleep < 6) {
        riskScore += 40;
        factors.duration = { value: `${avgSleep} hrs`, impact: 'high', description: 'Chronic sleep deprivation' };
        recommendations.push('Improve sleep hygiene and establish consistent sleep schedule');
    } else if (avgSleep < 7) {
        riskScore += 25;
        factors.duration = { value: `${avgSleep} hrs`, impact: 'moderate', description: 'Insufficient sleep' };
        recommendations.push('Aim for 7-9 hours of sleep per night');
    }

    const description = riskScore >= 50
        ? 'Your sleep patterns indicate a possible sleep disorder that requires medical evaluation.'
        : 'Your sleep duration is below optimal levels for health and wellbeing.';

    return {
        score: Math.min(100, Math.max(0, riskScore)),
        factors,
        recommendations,
        description
    };
}

// Get risk level from score
function getRiskLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'moderate';
    return 'low';
}

// Generate age-based test recommendations
function generateAgeBasedTests(age, gender) {
    const tests = [];

    // Annual physical for 40+
    if (age >= 40) {
        tests.push({
            test_name: 'Annual Physical Examination',
            test_category: 'routine_screening',
            priority_level: 'medium',
            reason: 'Recommended annual health checkup for adults 40+',
            recommended_frequency: 'annually',
            age_based: true,
            related_conditions: ['General Health Monitoring']
        });

        tests.push({
            test_name: 'Lipid Panel',
            test_category: 'routine_screening',
            priority_level: 'medium',
            reason: 'Cholesterol screening recommended for adults 40+',
            recommended_frequency: 'every_5_years',
            age_based: true,
            related_conditions: ['Cardiovascular Disease', 'Diabetes']
        });
    }

    // Colonoscopy for 50+
    if (age >= 50) {
        tests.push({
            test_name: 'Colonoscopy',
            test_category: 'routine_screening',
            priority_level: 'high',
            reason: 'Colorectal cancer screening recommended starting at age 50',
            recommended_frequency: 'every_10_years',
            age_based: true,
            related_conditions: ['Colorectal Cancer']
        });
    }

    // Gender-specific tests
    if (gender?.toLowerCase() === 'female' && age >= 40) {
        tests.push({
            test_name: 'Mammogram',
            test_category: 'routine_screening',
            priority_level: 'high',
            reason: 'Breast cancer screening recommended for women 40+',
            recommended_frequency: 'annually',
            age_based: true,
            related_conditions: ['Breast Cancer']
        });
    }

    if (gender?.toLowerCase() === 'male' && age >= 50) {
        tests.push({
            test_name: 'PSA Test',
            test_category: 'routine_screening',
            priority_level: 'medium',
            reason: 'Prostate cancer screening recommended for men 50+',
            recommended_frequency: 'annually',
            age_based: true,
            related_conditions: ['Prostate Cancer']
        });
    }

    // Bone density for 65+
    if (age >= 65) {
        tests.push({
            test_name: 'Bone Density Scan (DEXA)',
            test_category: 'routine_screening',
            priority_level: 'medium',
            reason: 'Osteoporosis screening recommended for seniors',
            recommended_frequency: 'every_2_years',
            age_based: true,
            related_conditions: ['Osteoporosis']
        });
    }

    return tests;
}

// Generate condition-based test recommendations
function generateConditionBasedTests(diseases) {
    const tests = [];
    const diseasesLower = diseases.toLowerCase();

    if (diseasesLower.includes('diabetes')) {
        tests.push({
            test_name: 'HbA1c Test',
            test_category: 'diagnostic',
            priority_level: 'high',
            reason: 'Regular monitoring for diabetes management',
            recommended_frequency: 'every_3_months',
            condition_based: true,
            related_conditions: ['Diabetes']
        });
    }

    if (diseasesLower.includes('hypertension') || diseasesLower.includes('blood pressure')) {
        tests.push({
            test_name: 'Blood Pressure Monitoring',
            test_category: 'diagnostic',
            priority_level: 'high',
            reason: 'Regular monitoring for hypertension management',
            recommended_frequency: 'monthly',
            condition_based: true,
            related_conditions: ['Hypertension']
        });
    }

    if (diseasesLower.includes('thyroid')) {
        tests.push({
            test_name: 'Thyroid Function Test (TSH)',
            test_category: 'diagnostic',
            priority_level: 'medium',
            reason: 'Monitor thyroid hormone levels',
            recommended_frequency: 'every_6_months',
            condition_based: true,
            related_conditions: ['Thyroid Disorder']
        });
    }

    return tests;
}

// Generate lifestyle-based test recommendations
function generateLifestyleBasedTests(lifestyleData, bmi) {
    const tests = [];

    // Poor sleep quality
    if (lifestyleData.stats.avgSleep < 6) {
        tests.push({
            test_name: 'Sleep Study (Polysomnography)',
            test_category: 'diagnostic',
            priority_level: 'medium',
            reason: 'Chronic poor sleep quality may indicate sleep disorder',
            recommended_frequency: 'as_needed',
            lifestyle_based: true,
            related_conditions: ['Sleep Apnea', 'Insomnia']
        });
    }

    // Low activity + high BMI
    if (lifestyleData.stats.avgSteps < 5000 && bmi > 25) {
        tests.push({
            test_name: 'Cardiac Stress Test',
            test_category: 'preventive',
            priority_level: 'medium',
            reason: 'Sedentary lifestyle with elevated BMI increases cardiovascular risk',
            recommended_frequency: 'as_needed',
            lifestyle_based: true,
            related_conditions: ['Cardiovascular Disease']
        });
    }

    return tests;
}
