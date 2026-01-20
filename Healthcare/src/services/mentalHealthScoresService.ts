import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface MentalHealthScores {
    user_id: string;
    mood_stability_index: number; // 0-100
    stress_resilience_score: number; // 0-100
    burnout_risk_score: number; // 0-100
    social_connection_index: number; // 0-100
    cognitive_fatigue_score: number; // 0-100
    overall_wellbeing_score: number; // 0-100
    calculation_metadata?: Record<string, any>;
}

// ============================================
// CALCULATE AND SAVE SCORES
// ============================================

export async function calculateAndSaveScores(userId: string, days = 30): Promise<{ data: MentalHealthScores | null; error: any }> {
    try {
        // Call Supabase functions to calculate each score
        const [moodStability, stressResilience, burnoutRisk, socialConnection, cognitiveFatigue] = await Promise.all([
            supabase.rpc('calculate_mood_stability_index', { p_user_id: userId, p_days: days }),
            supabase.rpc('calculate_stress_resilience_score', { p_user_id: userId, p_days: days }),
            supabase.rpc('calculate_burnout_risk_score', { p_user_id: userId, p_days: days }),
            supabase.rpc('calculate_social_connection_index', { p_user_id: userId, p_days: days }),
            supabase.rpc('calculate_cognitive_fatigue_score', { p_user_id: userId, p_days: days })
        ]);

        const scores: MentalHealthScores = {
            user_id: userId,
            mood_stability_index: moodStability.data || 0,
            stress_resilience_score: stressResilience.data || 0,
            burnout_risk_score: burnoutRisk.data || 0,
            social_connection_index: socialConnection.data || 0,
            cognitive_fatigue_score: cognitiveFatigue.data || 0,
            overall_wellbeing_score: 0, // Will calculate below
            calculation_metadata: {
                calculated_at: new Date().toISOString(),
                days_analyzed: days
            }
        };

        // Calculate overall wellbeing score (weighted average)
        scores.overall_wellbeing_score = Math.round(
            (scores.mood_stability_index * 0.25) +
            (scores.stress_resilience_score * 0.2) +
            ((100 - scores.burnout_risk_score) * 0.25) + // Invert burnout risk
            (scores.social_connection_index * 0.15) +
            ((100 - scores.cognitive_fatigue_score) * 0.15) // Invert cognitive fatigue
        );

        // Save to database
        const { data, error } = await supabase
            .from('mental_health_scores')
            .insert(scores)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error calculating and saving scores:', error);
        return { data: null, error };
    }
}

// ============================================
// GET SCORES
// ============================================

export async function getLatestScores(userId: string): Promise<{ data: MentalHealthScores | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('mental_health_scores')
            .select('*')
            .eq('user_id', userId)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching latest scores:', error);
        return { data: null, error };
    }
}

export async function getScoresHistory(userId: string, days = 90): Promise<{ data: MentalHealthScores[] | null; error: any }> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('mental_health_scores')
            .select('*')
            .eq('user_id', userId)
            .gte('calculated_at', startDate.toISOString())
            .order('calculated_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching scores history:', error);
        return { data: null, error };
    }
}

// ============================================
// SCORE INTERPRETATION
// ============================================

export function interpretMoodStability(score: number): { level: string; description: string; color: string } {
    if (score >= 70) {
        return {
            level: 'Excellent',
            description: 'Your mood is very stable with minimal fluctuations',
            color: 'text-success'
        };
    } else if (score >= 50) {
        return {
            level: 'Good',
            description: 'Your mood shows healthy variation with overall stability',
            color: 'text-primary'
        };
    } else if (score >= 30) {
        return {
            level: 'Moderate',
            description: 'Your mood shows some fluctuation that may benefit from attention',
            color: 'text-warning'
        };
    } else {
        return {
            level: 'Needs Attention',
            description: 'Your mood shows significant fluctuation - consider reaching out for support',
            color: 'text-destructive'
        };
    }
}

export function interpretStressResilience(score: number): { level: string; description: string; color: string } {
    if (score >= 70) {
        return {
            level: 'High',
            description: 'You handle stress very well and recover quickly',
            color: 'text-success'
        };
    } else if (score >= 50) {
        return {
            level: 'Moderate',
            description: 'You manage stress reasonably well',
            color: 'text-primary'
        };
    } else if (score >= 30) {
        return {
            level: 'Low',
            description: 'Stress may be impacting you more than usual',
            color: 'text-warning'
        };
    } else {
        return {
            level: 'Very Low',
            description: 'You may be struggling with stress - consider stress management techniques',
            color: 'text-destructive'
        };
    }
}

export function interpretBurnoutRisk(score: number): { level: string; description: string; color: string } {
    if (score >= 70) {
        return {
            level: 'High Risk',
            description: 'Signs of burnout detected - please prioritize self-care',
            color: 'text-destructive'
        };
    } else if (score >= 50) {
        return {
            level: 'Moderate Risk',
            description: 'Some burnout indicators present - watch your energy levels',
            color: 'text-warning'
        };
    } else if (score >= 30) {
        return {
            level: 'Low Risk',
            description: 'Minimal burnout signs - maintain healthy habits',
            color: 'text-primary'
        };
    } else {
        return {
            level: 'Minimal Risk',
            description: 'You\'re managing your energy well',
            color: 'text-success'
        };
    }
}

export function interpretSocialConnection(score: number): { level: string; description: string; color: string } {
    if (score >= 70) {
        return {
            level: 'Strong',
            description: 'You have healthy social connections',
            color: 'text-success'
        };
    } else if (score >= 50) {
        return {
            level: 'Moderate',
            description: 'Your social connections are adequate',
            color: 'text-primary'
        };
    } else if (score >= 30) {
        return {
            level: 'Limited',
            description: 'Consider reaching out to friends or loved ones',
            color: 'text-warning'
        };
    } else {
        return {
            level: 'Low',
            description: 'Social connection may need attention - consider connecting with others',
            color: 'text-destructive'
        };
    }
}

export function interpretCognitiveFatigue(score: number): { level: string; description: string; color: string } {
    if (score >= 70) {
        return {
            level: 'High',
            description: 'You may be experiencing significant mental fatigue',
            color: 'text-destructive'
        };
    } else if (score >= 50) {
        return {
            level: 'Moderate',
            description: 'Some mental fatigue detected - consider taking breaks',
            color: 'text-warning'
        };
    } else if (score >= 30) {
        return {
            level: 'Low',
            description: 'Your cognitive function is good',
            color: 'text-primary'
        };
    } else {
        return {
            level: 'Minimal',
            description: 'You\'re mentally sharp and focused',
            color: 'text-success'
        };
    }
}

export function interpretOverallWellbeing(score: number): { level: string; description: string; color: string } {
    if (score >= 75) {
        return {
            level: 'Excellent',
            description: 'Your overall mental wellbeing is very strong',
            color: 'text-success'
        };
    } else if (score >= 60) {
        return {
            level: 'Good',
            description: 'Your mental wellbeing is healthy',
            color: 'text-primary'
        };
    } else if (score >= 40) {
        return {
            level: 'Fair',
            description: 'Your wellbeing could benefit from some attention',
            color: 'text-warning'
        };
    } else {
        return {
            level: 'Needs Support',
            description: 'Consider reaching out for professional support',
            color: 'text-destructive'
        };
    }
}

// ============================================
// RECOMMENDATIONS
// ============================================

export function getRecommendations(scores: MentalHealthScores): string[] {
    const recommendations: string[] = [];

    if (scores.mood_stability_index < 50) {
        recommendations.push('Practice daily mood tracking to identify patterns');
        recommendations.push('Consider mindfulness or meditation exercises');
    }

    if (scores.stress_resilience_score < 50) {
        recommendations.push('Try breathing exercises when feeling stressed');
        recommendations.push('Build a stress management routine');
    }

    if (scores.burnout_risk_score > 50) {
        recommendations.push('Prioritize rest and recovery time');
        recommendations.push('Set boundaries around work and personal time');
        recommendations.push('Engage in activities that energize you');
    }

    if (scores.social_connection_index < 50) {
        recommendations.push('Reach out to a friend or family member');
        recommendations.push('Join a community or group activity');
    }

    if (scores.cognitive_fatigue_score > 50) {
        recommendations.push('Take regular breaks during focused work');
        recommendations.push('Ensure you\'re getting adequate sleep');
        recommendations.push('Try cognitive games to maintain mental sharpness');
    }

    if (recommendations.length === 0) {
        recommendations.push('Keep up your healthy habits!');
        recommendations.push('Continue monitoring your mental health');
    }

    return recommendations;
}
