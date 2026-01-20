import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface BreathingSession {
    user_id: string;
    session_duration: number; // seconds
    target_duration: number;
    completed: boolean;
    drop_off_time?: number;
    completion_rate: number;
    stress_before?: number; // 1-10
    stress_after?: number; // 1-10
    recovery_speed?: number;
}

export interface JournalEntry {
    user_id: string;
    prompt_text: string;
    entry_text: string;
    word_count: number;
    sentiment_score?: number;
    emotion_frequency?: Record<string, number>;
    rumination_detected?: boolean;
    key_themes?: string[];
}

export interface SleepReflection {
    user_id: string;
    sleep_quality: number; // 1-5
    hours_slept: number;
    wake_up_count: number;
    had_dreams: boolean;
    dream_description?: string;
    dream_sentiment?: number;
    sleep_issues?: string[];
}

// ============================================
// BREATHING EXERCISE
// ============================================

export async function saveBreathingSession(data: BreathingSession) {
    try {
        // Calculate recovery speed if both stress levels provided
        let recovery_speed = data.recovery_speed;
        if (data.stress_before && data.stress_after) {
            const stressReduction = data.stress_before - data.stress_after;
            recovery_speed = (stressReduction / data.session_duration) * 60; // per minute
        }

        const { data: result, error } = await supabase
            .from('breathing_sessions')
            .insert({ ...data, recovery_speed })
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving breathing session:', error);
        return { data: null, error };
    }
}

export async function getBreathingSessionHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('breathing_sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching breathing session history:', error);
        return { data: null, error };
    }
}

export async function getBreathingAnalytics(userId: string, days = 30) {
    try {
        const { data, error } = await getBreathingSessionHistory(userId, days);

        if (error || !data || data.length === 0) return { data: null, error };

        const completionRate = (data.filter(s => s.completed).length / data.length) * 100;
        const avgDuration = data.reduce((sum, s) => sum + s.session_duration, 0) / data.length;
        const avgRecoverySpeed = data
            .filter(s => s.recovery_speed)
            .reduce((sum, s) => sum + (s.recovery_speed || 0), 0) /
            data.filter(s => s.recovery_speed).length;

        const analytics = {
            total_sessions: data.length,
            completion_rate: completionRate,
            average_duration: avgDuration,
            average_recovery_speed: avgRecoverySpeed,
            stress_reduction_trend: data
                .filter(s => s.stress_before && s.stress_after)
                .map(s => ({
                    date: s.created_at,
                    reduction: (s.stress_before || 0) - (s.stress_after || 0)
                }))
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error calculating breathing analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// AI JOURNALING
// ============================================

export async function saveJournalEntry(data: JournalEntry) {
    try {
        // Calculate word count
        const word_count = data.entry_text.trim().split(/\s+/).length;

        // Simple sentiment analysis
        const sentiment_score = calculateSentiment(data.entry_text);

        // Detect rumination (repeated negative themes)
        const rumination_detected = detectRumination(data.entry_text);

        // Extract emotion frequency
        const emotion_frequency = extractEmotions(data.entry_text);

        const { data: result, error } = await supabase
            .from('journal_entries')
            .insert({
                ...data,
                word_count,
                sentiment_score,
                rumination_detected,
                emotion_frequency
            })
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving journal entry:', error);
        return { data: null, error };
    }
}

export async function getJournalEntryHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching journal entry history:', error);
        return { data: null, error };
    }
}

export async function getJournalingAnalytics(userId: string, days = 30) {
    try {
        const { data, error } = await getJournalEntryHistory(userId, days);

        if (error || !data || data.length === 0) return { data: null, error };

        const avgSentiment = data.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / data.length;
        const ruminationRate = (data.filter(e => e.rumination_detected).length / data.length) * 100;
        const avgWordCount = data.reduce((sum, e) => sum + (e.word_count || 0), 0) / data.length;

        // Aggregate emotion frequencies
        const emotionTotals: Record<string, number> = {};
        data.forEach(entry => {
            if (entry.emotion_frequency) {
                Object.entries(entry.emotion_frequency).forEach(([emotion, count]) => {
                    emotionTotals[emotion] = (emotionTotals[emotion] || 0) + (count as number);
                });
            }
        });

        const analytics = {
            total_entries: data.length,
            average_sentiment: avgSentiment,
            rumination_rate: ruminationRate,
            average_word_count: avgWordCount,
            emotion_distribution: emotionTotals,
            sentiment_trend: data.map(e => ({
                date: e.created_at,
                sentiment: e.sentiment_score
            }))
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error calculating journaling analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// SLEEP REFLECTION
// ============================================

export async function saveSleepReflection(data: SleepReflection) {
    try {
        // Analyze dream sentiment if dream description provided
        let dream_sentiment = data.dream_sentiment;
        if (data.had_dreams && data.dream_description) {
            dream_sentiment = calculateSentiment(data.dream_description);
        }

        const { data: result, error } = await supabase
            .from('sleep_reflections')
            .insert({ ...data, dream_sentiment })
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving sleep reflection:', error);
        return { data: null, error };
    }
}

export async function getSleepReflectionHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('sleep_reflections')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching sleep reflection history:', error);
        return { data: null, error };
    }
}

export async function getSleepAnalytics(userId: string, days = 30) {
    try {
        const { data, error } = await getSleepReflectionHistory(userId, days);

        if (error || !data || data.length === 0) return { data: null, error };

        const avgQuality = data.reduce((sum, s) => sum + s.sleep_quality, 0) / data.length;
        const avgHours = data.reduce((sum, s) => sum + (s.hours_slept || 0), 0) / data.length;
        const avgWakeUps = data.reduce((sum, s) => sum + s.wake_up_count, 0) / data.length;
        const nightmareRate = (data.filter(s => s.had_dreams && (s.dream_sentiment || 0) < -0.3).length / data.length) * 100;

        // Aggregate sleep issues
        const issueFrequency: Record<string, number> = {};
        data.forEach(entry => {
            entry.sleep_issues?.forEach(issue => {
                issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
            });
        });

        const analytics = {
            total_reflections: data.length,
            average_quality: avgQuality,
            average_hours: avgHours,
            average_wake_ups: avgWakeUps,
            nightmare_rate: nightmareRate,
            sleep_issue_frequency: issueFrequency,
            quality_trend: data.map(s => ({
                date: s.created_at,
                quality: s.sleep_quality,
                hours: s.hours_slept
            }))
        };

        return { data: analytics, error: null };
    } catch (error) {
        console.error('Error calculating sleep analytics:', error);
        return { data: null, error };
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateSentiment(text: string): number {
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'joy', 'peaceful', 'grateful', 'blessed', 'calm', 'relaxed', 'content'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious', 'worried', 'stressed', 'fear', 'nightmare', 'restless'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) score += matches.length * 0.15;
    });

    negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) score -= matches.length * 0.15;
    });

    return Math.max(-1, Math.min(1, score));
}

function detectRumination(text: string): boolean {
    const ruminationIndicators = [
        'keep thinking',
        'can\'t stop',
        'over and over',
        'again and again',
        'constantly',
        'always thinking',
        'won\'t stop'
    ];

    const lowerText = text.toLowerCase();
    return ruminationIndicators.some(indicator => lowerText.includes(indicator));
}

function extractEmotions(text: string): Record<string, number> {
    const emotions: Record<string, string[]> = {
        joy: ['happy', 'joyful', 'excited', 'delighted', 'cheerful'],
        sadness: ['sad', 'unhappy', 'depressed', 'down', 'blue'],
        anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'tense'],
        anger: ['angry', 'mad', 'furious', 'irritated', 'frustrated'],
        fear: ['afraid', 'scared', 'fearful', 'terrified', 'frightened'],
        calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil']
    };

    const lowerText = text.toLowerCase();
    const frequency: Record<string, number> = {};

    Object.entries(emotions).forEach(([emotion, words]) => {
        let count = 0;
        words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(regex);
            if (matches) count += matches.length;
        });
        if (count > 0) frequency[emotion] = count;
    });

    return frequency;
}
