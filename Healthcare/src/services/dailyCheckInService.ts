import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface DailyMoodEntry {
    user_id: string;
    mood_score: number; // 0-100
    mood_emoji?: string;
    daily_variance?: number;
}

export interface EnergyMotivationEntry {
    user_id: string;
    energy_level: number; // 1-5
    motivation_level: number; // 1-5
    feeling_drained: boolean;
    felt_motivated_today: boolean;
    notes?: string;
}

export interface ThoughtPattern {
    user_id: string;
    thought_text: string;
    sentiment_score?: number;
    cognitive_distortions?: Record<string, any>;
    emotion_tags?: string[];
    is_rumination?: boolean;
}

export interface SocialInteractionEntry {
    user_id: string;
    talked_to_someone: boolean;
    felt_connected: boolean;
    connection_quality?: number; // 1-5
    social_energy?: 'energized' | 'neutral' | 'drained';
    notes?: string;
}

// ============================================
// DAILY MOOD SLIDER
// ============================================

export async function saveDailyMood(data: DailyMoodEntry) {
    try {
        // Calculate daily variance from previous entries
        const { data: previousEntries } = await supabase
            .from('daily_mood_entries')
            .select('mood_score')
            .eq('user_id', data.user_id)
            .order('created_at', { ascending: false })
            .limit(7);

        let daily_variance = 0;
        if (previousEntries && previousEntries.length > 0) {
            const scores = previousEntries.map(e => e.mood_score);
            const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
            const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
            daily_variance = Math.sqrt(variance);
        }

        const { data: result, error } = await supabase
            .from('daily_mood_entries')
            .insert({ ...data, daily_variance })
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving daily mood:', error);
        return { data: null, error };
    }
}

export async function getDailyMoodHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('daily_mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching daily mood history:', error);
        return { data: null, error };
    }
}

export async function getMoodTrend(userId: string, days = 7) {
    try {
        const { data, error } = await getDailyMoodHistory(userId, days);

        if (error || !data) return { data: [], error };

        // Group by day
        const trendData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString(),
            mood: entry.mood_score,
            variance: entry.daily_variance || 0
        }));

        return { data: trendData, error: null };
    } catch (error) {
        console.error('Error calculating mood trend:', error);
        return { data: null, error };
    }
}

// ============================================
// ENERGY & MOTIVATION
// ============================================

export async function saveEnergyMotivation(data: EnergyMotivationEntry) {
    try {
        const { data: result, error } = await supabase
            .from('energy_motivation_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving energy motivation:', error);
        return { data: null, error };
    }
}

export async function getEnergyMotivationHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('energy_motivation_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching energy motivation history:', error);
        return { data: null, error };
    }
}

export async function getBurnoutIndicators(userId: string, days = 14) {
    try {
        const { data, error } = await getEnergyMotivationHistory(userId, days);

        if (error || !data) return { data: null, error };

        const avgEnergy = data.reduce((sum, e) => sum + e.energy_level, 0) / data.length;
        const avgMotivation = data.reduce((sum, e) => sum + e.motivation_level, 0) / data.length;
        const drainedDays = data.filter(e => e.feeling_drained).length;
        const unmotivatedDays = data.filter(e => !e.felt_motivated_today).length;

        const burnoutRisk = {
            average_energy: avgEnergy,
            average_motivation: avgMotivation,
            drained_percentage: (drainedDays / data.length) * 100,
            unmotivated_percentage: (unmotivatedDays / data.length) * 100,
            risk_level: avgEnergy < 2.5 && avgMotivation < 2.5 ? 'high' : avgEnergy < 3.5 ? 'moderate' : 'low'
        };

        return { data: burnoutRisk, error: null };
    } catch (error) {
        console.error('Error calculating burnout indicators:', error);
        return { data: null, error };
    }
}

// ============================================
// THOUGHT PATTERNS
// ============================================

export async function saveThoughtPattern(data: ThoughtPattern) {
    try {
        // Simple sentiment analysis (can be enhanced with AI later)
        const sentiment_score = calculateSimpleSentiment(data.thought_text);

        const { data: result, error } = await supabase
            .from('thought_patterns')
            .insert({ ...data, sentiment_score })
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving thought pattern:', error);
        return { data: null, error };
    }
}

export async function getThoughtPatternHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('thought_patterns')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching thought pattern history:', error);
        return { data: null, error };
    }
}

export async function getRuminationAnalysis(userId: string, days = 14) {
    try {
        const { data, error } = await getThoughtPatternHistory(userId, days);

        if (error || !data) return { data: null, error };

        const avgSentiment = data.reduce((sum, t) => sum + (t.sentiment_score || 0), 0) / data.length;
        const ruminationCount = data.filter(t => t.is_rumination).length;
        const negativeThoughts = data.filter(t => (t.sentiment_score || 0) < -0.3).length;

        const analysis = {
            average_sentiment: avgSentiment,
            rumination_percentage: (ruminationCount / data.length) * 100,
            negative_thought_percentage: (negativeThoughts / data.length) * 100,
            sentiment_trend: data.map(t => ({
                date: t.created_at,
                sentiment: t.sentiment_score
            }))
        };

        return { data: analysis, error: null };
    } catch (error) {
        console.error('Error analyzing rumination:', error);
        return { data: null, error };
    }
}

// ============================================
// SOCIAL INTERACTION
// ============================================

export async function saveSocialInteraction(data: SocialInteractionEntry) {
    try {
        const { data: result, error } = await supabase
            .from('social_interaction_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving social interaction:', error);
        return { data: null, error };
    }
}

export async function getSocialInteractionHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('social_interaction_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching social interaction history:', error);
        return { data: null, error };
    }
}

export async function getSocialConnectionIndex(userId: string, days = 30) {
    try {
        const { data, error } = await getSocialInteractionHistory(userId, days);

        if (error || !data || data.length === 0) return { data: null, error };

        const interactionRate = (data.filter(e => e.talked_to_someone).length / data.length) * 100;
        const connectionRate = (data.filter(e => e.felt_connected).length / data.length) * 100;
        const avgQuality = data
            .filter(e => e.connection_quality)
            .reduce((sum, e) => sum + (e.connection_quality || 0), 0) /
            data.filter(e => e.connection_quality).length;

        const withdrawalDays = data.filter(e => !e.talked_to_someone).length;
        const consecutiveWithdrawal = calculateConsecutiveWithdrawal(data);

        const index = {
            interaction_rate: interactionRate,
            connection_rate: connectionRate,
            average_quality: avgQuality * 20, // Convert to 0-100 scale
            withdrawal_days: withdrawalDays,
            consecutive_withdrawal: consecutiveWithdrawal,
            overall_score: (interactionRate * 0.4) + (connectionRate * 0.3) + (avgQuality * 20 * 0.3)
        };

        return { data: index, error: null };
    } catch (error) {
        console.error('Error calculating social connection index:', error);
        return { data: null, error };
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateSimpleSentiment(text: string): number {
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'joy', 'peaceful', 'grateful', 'blessed'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious', 'worried', 'stressed'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 0.2;
    });

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
}

function calculateConsecutiveWithdrawal(entries: any[]): number {
    let maxConsecutive = 0;
    let current = 0;

    entries.forEach(entry => {
        if (!entry.talked_to_someone) {
            current++;
            maxConsecutive = Math.max(maxConsecutive, current);
        } else {
            current = 0;
        }
    });

    return maxConsecutive;
}
