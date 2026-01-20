import { supabase } from '@/lib/supabase';
import type { MoodEntry, WellnessActivity, MoodStats } from './mentalHealthService';

export interface GameRecord {
    id?: string;
    user_id: string;
    game_type: string;
    score: number;
    duration: number;
    difficulty: string;
    metadata?: any;
    completed_at: string;
}

export interface MoodPattern {
    id?: string;
    user_id: string;
    pattern_type: string;
    pattern_data: any;
    confidence_score: number;
    detected_at: string;
}

export interface MentalHealthInsight {
    id?: string;
    user_id: string;
    insight_type: string;
    insight_text: string;
    recommendations: string[];
    severity: string;
    created_at: string;
    acknowledged: boolean;
}

export interface AnalyticsData {
    mentalHealthScore: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    weeklyAverage: number;
    monthlyAverage: number;
    mostEffectiveActivity: string;
    streakDays: number;
    totalEntries: number;
    insights: MentalHealthInsight[];
}

/**
 * Save a game record to the database
 */
export async function saveGameRecord(
    userId: string,
    gameType: string,
    score: number,
    duration: number,
    difficulty: string = 'medium',
    metadata?: any
): Promise<{ data: GameRecord | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('mental_health_games')
            .insert({
                user_id: userId,
                game_type: gameType,
                score,
                duration,
                difficulty,
                metadata,
                completed_at: new Date().toISOString(),
            })
            .select()
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error saving game record:', error);
        return { data: null, error };
    }
}

/**
 * Get game statistics for a user
 */
export async function getGameStats(userId: string, gameType?: string) {
    try {
        let query = supabase
            .from('mental_health_games')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

        if (gameType) {
            query = query.eq('game_type', gameType);
        }

        const { data, error } = await query.limit(100);

        if (error) throw error;

        const totalGames = data?.length || 0;
        const averageScore = data?.reduce((sum, game) => sum + (game.score || 0), 0) / (totalGames || 1);
        const highScore = Math.max(...(data?.map(g => g.score || 0) || [0]));
        const totalDuration = data?.reduce((sum, game) => sum + (game.duration || 0), 0) || 0;

        return {
            totalGames,
            averageScore: Math.round(averageScore),
            highScore,
            totalDuration,
            recentGames: data?.slice(0, 10) || [],
        };
    } catch (error) {
        console.error('Error fetching game stats:', error);
        return {
            totalGames: 0,
            averageScore: 0,
            highScore: 0,
            totalDuration: 0,
            recentGames: [],
        };
    }
}

/**
 * Analyze mood patterns and detect trends
 */
export async function analyzeMoodPatterns(userId: string): Promise<MoodPattern[]> {
    try {
        const { data: moodEntries, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: true });

        if (error || !moodEntries || moodEntries.length < 7) {
            return [];
        }

        const patterns: MoodPattern[] = [];

        // Detect weekly patterns
        const dayOfWeekMoods: { [key: number]: number[] } = {};
        moodEntries.forEach(entry => {
            const day = new Date(entry.created_at).getDay();
            if (!dayOfWeekMoods[day]) dayOfWeekMoods[day] = [];
            dayOfWeekMoods[day].push(entry.mood_value);
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let bestDay = 0;
        let worstDay = 0;
        let bestAvg = 0;
        let worstAvg = 5;

        Object.keys(dayOfWeekMoods).forEach(day => {
            const avg = dayOfWeekMoods[parseInt(day)].reduce((a, b) => a + b, 0) / dayOfWeekMoods[parseInt(day)].length;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestDay = parseInt(day);
            }
            if (avg < worstAvg) {
                worstAvg = avg;
                worstDay = parseInt(day);
            }
        });

        if (bestAvg - worstAvg > 0.5) {
            patterns.push({
                user_id: userId,
                pattern_type: 'weekly_cycle',
                pattern_data: {
                    best_day: dayNames[bestDay],
                    worst_day: dayNames[worstDay],
                    best_avg: bestAvg.toFixed(2),
                    worst_avg: worstAvg.toFixed(2),
                },
                confidence_score: Math.min(0.99, (bestAvg - worstAvg) / 4),
                detected_at: new Date().toISOString(),
            });
        }

        // Detect trend (improving/declining)
        const recentMoods = moodEntries.slice(-14).map(e => e.mood_value);
        const olderMoods = moodEntries.slice(-28, -14).map(e => e.mood_value);

        if (recentMoods.length >= 7 && olderMoods.length >= 7) {
            const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
            const olderAvg = olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length;
            const change = recentAvg - olderAvg;

            if (Math.abs(change) > 0.3) {
                patterns.push({
                    user_id: userId,
                    pattern_type: 'mood_trend',
                    pattern_data: {
                        trend: change > 0 ? 'improving' : 'declining',
                        change: change.toFixed(2),
                        recent_avg: recentAvg.toFixed(2),
                        older_avg: olderAvg.toFixed(2),
                    },
                    confidence_score: Math.min(0.99, Math.abs(change) / 2),
                    detected_at: new Date().toISOString(),
                });
            }
        }

        // Save patterns to database
        if (patterns.length > 0) {
            await supabase.from('mood_patterns').insert(patterns);
        }

        return patterns;
    } catch (error) {
        console.error('Error analyzing mood patterns:', error);
        return [];
    }
}

/**
 * Generate AI-powered insights based on user data
 */
export async function generateInsights(userId: string): Promise<MentalHealthInsight[]> {
    try {
        const [moodData, activityData, patterns] = await Promise.all([
            supabase.from('mood_entries').select('*').eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
            supabase.from('wellness_activities').select('*').eq('user_id', userId)
                .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
            analyzeMoodPatterns(userId),
        ]);

        const insights: MentalHealthInsight[] = [];
        const moods = moodData.data || [];
        const activities = activityData.data || [];

        // Insight 1: Low mood frequency
        const lowMoodCount = moods.filter(m => m.mood_value <= 2).length;
        if (lowMoodCount > moods.length * 0.3) {
            insights.push({
                user_id: userId,
                insight_type: 'mood_concern',
                insight_text: `You've experienced low mood ${lowMoodCount} times in the past 30 days. This is ${Math.round(lowMoodCount / moods.length * 100)}% of your entries.`,
                recommendations: [
                    'Consider talking to a mental health professional',
                    'Try daily meditation or breathing exercises',
                    'Engage in physical activity for 30 minutes daily',
                    'Maintain a consistent sleep schedule',
                ],
                severity: lowMoodCount > moods.length * 0.5 ? 'high' : 'medium',
                created_at: new Date().toISOString(),
                acknowledged: false,
            });
        }

        // Insight 2: Activity effectiveness
        const activityMoodMap: { [key: string]: number[] } = {};
        activities.forEach(activity => {
            const activityTime = new Date(activity.completed_at).getTime();
            const moodsAfter = moods.filter(m => {
                const moodTime = new Date(m.created_at).getTime();
                return moodTime > activityTime && moodTime < activityTime + 24 * 60 * 60 * 1000;
            });

            if (moodsAfter.length > 0) {
                if (!activityMoodMap[activity.activity_type]) {
                    activityMoodMap[activity.activity_type] = [];
                }
                activityMoodMap[activity.activity_type].push(...moodsAfter.map(m => m.mood_value));
            }
        });

        let bestActivity = '';
        let bestAvg = 0;
        Object.keys(activityMoodMap).forEach(activity => {
            const avg = activityMoodMap[activity].reduce((a, b) => a + b, 0) / activityMoodMap[activity].length;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestActivity = activity;
            }
        });

        if (bestActivity && bestAvg > 3.5) {
            insights.push({
                user_id: userId,
                insight_type: 'activity_recommendation',
                insight_text: `${bestActivity} seems to have the most positive impact on your mood, with an average mood of ${bestAvg.toFixed(1)} after engaging in this activity.`,
                recommendations: [
                    `Try to do ${bestActivity} more frequently`,
                    'Schedule this activity during times when you typically feel low',
                    'Track how you feel before and after this activity',
                ],
                severity: 'low',
                created_at: new Date().toISOString(),
                acknowledged: false,
            });
        }

        // Insight 3: Consistency
        if (moods.length < 10) {
            insights.push({
                user_id: userId,
                insight_type: 'engagement',
                insight_text: 'Regular mood tracking helps identify patterns and improve mental health awareness.',
                recommendations: [
                    'Set a daily reminder to log your mood',
                    'Try to track your mood at the same time each day',
                    'Add journal entries to provide context for your moods',
                ],
                severity: 'low',
                created_at: new Date().toISOString(),
                acknowledged: false,
            });
        }

        // Save insights to database
        if (insights.length > 0) {
            await supabase.from('mental_health_insights').insert(insights);
        }

        return insights;
    } catch (error) {
        console.error('Error generating insights:', error);
        return [];
    }
}

/**
 * Calculate comprehensive mental health score
 */
export async function calculateMentalHealthScore(userId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .rpc('calculate_mental_health_score', { p_user_id: userId });

        if (error) throw error;
        return data || 0;
    } catch (error) {
        console.error('Error calculating mental health score:', error);

        // Fallback calculation
        const { data: moods } = await supabase
            .from('mood_entries')
            .select('mood_value')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const { data: activities } = await supabase
            .from('wellness_activities')
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const avgMood = moods && moods.length > 0
            ? moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length
            : 3;

        const activityCount = activities?.length || 0;

        return Math.min(100, Math.max(0,
            Math.round((avgMood / 5.0 * 60) + (Math.min(activityCount, 20) * 2))
        ));
    }
}

/**
 * Get comprehensive analytics data
 */
export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
    try {
        const [score, patterns, insights, moodData, activityData] = await Promise.all([
            calculateMentalHealthScore(userId),
            analyzeMoodPatterns(userId),
            generateInsights(userId),
            supabase.from('mood_entries').select('*').eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true }),
            supabase.from('wellness_activities').select('*').eq('user_id', userId)
                .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const moods = moodData.data || [];
        const activities = activityData.data || [];

        // Calculate weekly and monthly averages
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        const weeklyMoods = moods.filter(m => new Date(m.created_at).getTime() > weekAgo);
        const monthlyMoods = moods.filter(m => new Date(m.created_at).getTime() > monthAgo);

        const weeklyAverage = weeklyMoods.length > 0
            ? weeklyMoods.reduce((sum, m) => sum + m.mood_value, 0) / weeklyMoods.length
            : 0;

        const monthlyAverage = monthlyMoods.length > 0
            ? monthlyMoods.reduce((sum, m) => sum + m.mood_value, 0) / monthlyMoods.length
            : 0;

        // Determine trend
        const trendPattern = patterns.find(p => p.pattern_type === 'mood_trend');
        const moodTrend = trendPattern?.pattern_data?.trend || 'stable';

        // Find most effective activity
        const activityCounts: { [key: string]: number } = {};
        activities.forEach(a => {
            activityCounts[a.activity_type] = (activityCounts[a.activity_type] || 0) + 1;
        });
        const mostEffectiveActivity = Object.keys(activityCounts).reduce((a, b) =>
            activityCounts[a] > activityCounts[b] ? a : b, 'meditation'
        );

        // Calculate streak
        let streakDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const hasEntry = moods.some(m => {
                const moodDate = new Date(m.created_at);
                moodDate.setHours(0, 0, 0, 0);
                return moodDate.getTime() === checkDate.getTime();
            });

            if (hasEntry) {
                streakDays++;
            } else if (i > 0) {
                break;
            }
        }

        return {
            mentalHealthScore: score,
            moodTrend: moodTrend as 'improving' | 'stable' | 'declining',
            weeklyAverage: Math.round(weeklyAverage * 10) / 10,
            monthlyAverage: Math.round(monthlyAverage * 10) / 10,
            mostEffectiveActivity,
            streakDays,
            totalEntries: moods.length,
            insights,
        };
    } catch (error) {
        console.error('Error getting analytics data:', error);
        return {
            mentalHealthScore: 0,
            moodTrend: 'stable',
            weeklyAverage: 0,
            monthlyAverage: 0,
            mostEffectiveActivity: 'meditation',
            streakDays: 0,
            totalEntries: 0,
            insights: [],
        };
    }
}

/**
 * Acknowledge an insight
 */
export async function acknowledgeInsight(insightId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('mental_health_insights')
            .update({
                acknowledged: true,
                acknowledged_at: new Date().toISOString(),
            })
            .eq('id', insightId);

        return !error;
    } catch (error) {
        console.error('Error acknowledging insight:', error);
        return false;
    }
}
