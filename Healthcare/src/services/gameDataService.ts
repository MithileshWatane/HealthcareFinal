import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface EmotionRecognitionResult {
    user_id: string;
    session_id?: string;
    total_questions: number;
    correct_answers: number;
    accuracy_rate: number;
    average_reaction_time: number;
    negative_emotion_bias: number;
    confusion_matrix: Record<string, any>;
    emotion_breakdown: Record<string, number>;
}

export interface AttentionFocusResult {
    user_id: string;
    session_id?: string;
    game_type: 'number_sequence' | 'stroop' | 'mixed';
    total_tasks: number;
    errors: number;
    impulsive_errors: number;
    average_response_time: number;
    task_abandonment_count: number;
    fatigue_curve: Record<string, any>;
}

export interface StressResponseResult {
    user_id: string;
    session_id?: string;
    difficulty_level: string;
    performance_score: number;
    error_spikes: Record<string, any>;
    stress_tolerance_score: number;
    recovery_time: number;
}

export interface DecisionMakingResult {
    user_id: string;
    session_id?: string;
    total_decisions: number;
    risky_choices: number;
    safe_choices: number;
    risk_preference_score: number;
    regret_behavior: Record<string, any>;
    decision_consistency: number;
}

// ============================================
// EMOTION RECOGNITION GAME
// ============================================

export async function saveEmotionRecognitionData(data: EmotionRecognitionResult) {
    try {
        const { data: result, error } = await supabase
            .from('emotion_recognition_data')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving emotion recognition data:', error);
        return { data: null, error };
    }
}

export async function getEmotionRecognitionHistory(userId: string, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('emotion_recognition_data')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching emotion recognition history:', error);
        return { data: null, error };
    }
}

export async function getEmotionRecognitionAnalytics(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('emotion_recognition_data')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_at', startDate.toISOString());

        if (error) throw error;

        // Calculate analytics
        const analytics = {
            total_sessions: data?.length || 0,
            average_accuracy: data?.reduce((sum, d) => sum + (d.accuracy_rate || 0), 0) / (data?.length || 1),
            average_reaction_time: data?.reduce((sum, d) => sum + (d.average_reaction_time || 0), 0) / (data?.length || 1),
            negative_bias_trend: data?.map(d => ({
                date: d.completed_at,
                bias: d.negative_emotion_bias
            })) || []
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error fetching emotion recognition analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// ATTENTION & FOCUS GAME
// ============================================

export async function saveAttentionFocusData(data: AttentionFocusResult) {
    try {
        const { data: result, error } = await supabase
            .from('attention_focus_data')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving attention focus data:', error);
        return { data: null, error };
    }
}

export async function getAttentionFocusHistory(userId: string, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('attention_focus_data')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching attention focus history:', error);
        return { data: null, error };
    }
}

export async function getAttentionFocusAnalytics(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('attention_focus_data')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_at', startDate.toISOString());

        if (error) throw error;

        const analytics = {
            total_sessions: data?.length || 0,
            average_errors: data?.reduce((sum, d) => sum + (d.errors || 0), 0) / (data?.length || 1),
            average_response_time: data?.reduce((sum, d) => sum + (d.average_response_time || 0), 0) / (data?.length || 1),
            impulsivity_rate: data?.reduce((sum, d) => sum + (d.impulsive_errors || 0), 0) / (data?.reduce((sum, d) => sum + (d.total_tasks || 1), 0)),
            performance_trend: data?.map(d => ({
                date: d.completed_at,
                error_rate: (d.errors / d.total_tasks) * 100
            })) || []
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error fetching attention focus analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// STRESS RESPONSE GAME
// ============================================

export async function saveStressResponseData(data: StressResponseResult) {
    try {
        const { data: result, error } = await supabase
            .from('stress_response_data')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving stress response data:', error);
        return { data: null, error };
    }
}

export async function getStressResponseHistory(userId: string, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('stress_response_data')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching stress response history:', error);
        return { data: null, error };
    }
}

export async function getStressResponseAnalytics(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('stress_response_data')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_at', startDate.toISOString());

        if (error) throw error;

        const analytics = {
            total_sessions: data?.length || 0,
            average_tolerance: data?.reduce((sum, d) => sum + (d.stress_tolerance_score || 0), 0) / (data?.length || 1),
            average_recovery_time: data?.reduce((sum, d) => sum + (d.recovery_time || 0), 0) / (data?.length || 1),
            resilience_trend: data?.map(d => ({
                date: d.completed_at,
                tolerance: d.stress_tolerance_score
            })) || []
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error fetching stress response analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// DECISION MAKING GAME
// ============================================

export async function saveDecisionMakingData(data: DecisionMakingResult) {
    try {
        const { data: result, error } = await supabase
            .from('decision_making_data')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving decision making data:', error);
        return { data: null, error };
    }
}

export async function getDecisionMakingHistory(userId: string, limit = 10) {
    try {
        const { data, error } = await supabase
            .from('decision_making_data')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching decision making history:', error);
        return { data: null, error };
    }
}

export async function getDecisionMakingAnalytics(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('decision_making_data')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_at', startDate.toISOString());

        if (error) throw error;

        const analytics = {
            total_sessions: data?.length || 0,
            average_risk_preference: data?.reduce((sum, d) => sum + (d.risk_preference_score || 0), 0) / (data?.length || 1),
            risk_taking_trend: data?.map(d => ({
                date: d.completed_at,
                risk_score: d.risk_preference_score
            })) || [],
            decision_consistency: data?.reduce((sum, d) => sum + (d.decision_consistency || 0), 0) / (data?.length || 1)
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error fetching decision making analytics:', error);
        return { data: null, error };
    }
}
