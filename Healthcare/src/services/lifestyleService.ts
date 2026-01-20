import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface SleepEntry {
    id?: string;
    user_id: string;
    date: string;
    duration_hours: number;
    quality_score?: number; // 1-5
    bedtime?: string;
    wake_time?: string;
    notes?: string;
    created_at?: string;
}

export interface ActivityEntry {
    id?: string;
    user_id: string;
    date: string;
    steps?: number;
    exercise_duration_minutes?: number;
    activity_type?: string;
    calories_burned?: number;
    notes?: string;
    created_at?: string;
}

export interface HydrationEntry {
    id?: string;
    user_id: string;
    date: string;
    cups_consumed: number;
    target_cups: number;
    created_at?: string;
}

export interface NutritionEntry {
    id?: string;
    user_id: string;
    date: string;
    calories: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description?: string;
    created_at?: string;
}

export interface LifestyleGoal {
    id?: string;
    user_id: string;
    category: 'sleep' | 'exercise' | 'hydration' | 'nutrition';
    title: string;
    target_value: number;
    current_value?: number;
    unit: string;
    deadline?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface WeeklyStats {
    avgSleep: number;
    avgSteps: number;
    avgHydration: number;
    avgCalories: number;
    sleepProgress: number;
    stepsProgress: number;
    hydrationProgress: number;
    caloriesProgress: number;
}

export interface DailyCheckIn {
    sleep?: Partial<SleepEntry>;
    activity?: Partial<ActivityEntry>;
    hydration?: Partial<HydrationEntry>;
    nutrition?: NutritionEntry[];
}

// ============================================
// SLEEP TRACKING
// ============================================

export async function saveSleepEntry(data: SleepEntry) {
    try {
        const { data: result, error } = await supabase
            .from('lifestyle_sleep_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving sleep entry:', error);
        return { data: null, error };
    }
}

export async function getSleepHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('lifestyle_sleep_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching sleep history:', error);
        return { data: null, error };
    }
}

export async function updateSleepEntry(id: string, updates: Partial<SleepEntry>) {
    try {
        const { data, error } = await supabase
            .from('lifestyle_sleep_entries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating sleep entry:', error);
        return { data: null, error };
    }
}

// ============================================
// ACTIVITY TRACKING
// ============================================

export async function saveActivityEntry(data: ActivityEntry) {
    try {
        const { data: result, error } = await supabase
            .from('lifestyle_activity_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving activity entry:', error);
        return { data: null, error };
    }
}

export async function getActivityHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('lifestyle_activity_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching activity history:', error);
        return { data: null, error };
    }
}

export async function updateActivityEntry(id: string, updates: Partial<ActivityEntry>) {
    try {
        const { data, error } = await supabase
            .from('lifestyle_activity_entries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating activity entry:', error);
        return { data: null, error };
    }
}

// ============================================
// HYDRATION TRACKING
// ============================================

export async function saveHydrationEntry(data: HydrationEntry) {
    try {
        const { data: result, error } = await supabase
            .from('lifestyle_hydration_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving hydration entry:', error);
        return { data: null, error };
    }
}

export async function getHydrationHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('lifestyle_hydration_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching hydration history:', error);
        return { data: null, error };
    }
}

export async function updateHydrationEntry(id: string, updates: Partial<HydrationEntry>) {
    try {
        const { data, error } = await supabase
            .from('lifestyle_hydration_entries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating hydration entry:', error);
        return { data: null, error };
    }
}

// ============================================
// NUTRITION TRACKING
// ============================================

export async function saveNutritionEntry(data: NutritionEntry) {
    try {
        const { data: result, error } = await supabase
            .from('lifestyle_nutrition_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error saving nutrition entry:', error);
        return { data: null, error };
    }
}

export async function getNutritionHistory(userId: string, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('lifestyle_nutrition_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching nutrition history:', error);
        return { data: null, error };
    }
}

export async function deleteNutritionEntry(id: string) {
    try {
        const { error } = await supabase
            .from('lifestyle_nutrition_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting nutrition entry:', error);
        return { error };
    }
}

// ============================================
// GOAL MANAGEMENT
// ============================================

export async function createGoal(data: LifestyleGoal) {
    try {
        const { data: result, error } = await supabase
            .from('lifestyle_goals')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return { data: result, error: null };
    } catch (error) {
        console.error('Error creating goal:', error);
        return { data: null, error };
    }
}

export async function getActiveGoals(userId: string) {
    try {
        const { data, error } = await supabase
            .from('lifestyle_goals')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching active goals:', error);
        return { data: null, error };
    }
}

export async function updateGoal(id: string, updates: Partial<LifestyleGoal>) {
    try {
        const { data, error } = await supabase
            .from('lifestyle_goals')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating goal:', error);
        return { data: null, error };
    }
}

export async function deleteGoal(id: string) {
    try {
        const { error } = await supabase
            .from('lifestyle_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting goal:', error);
        return { error };
    }
}

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

export async function getWeeklyStats(userId: string): Promise<{ data: WeeklyStats | null; error: any }> {
    try {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        const dateStr = weekAgo.toISOString().split('T')[0];

        // Fetch all data for the week
        const [sleepRes, activityRes, hydrationRes, nutritionRes] = await Promise.all([
            getSleepHistory(userId, 7),
            getActivityHistory(userId, 7),
            getHydrationHistory(userId, 7),
            getNutritionHistory(userId, 7),
        ]);

        if (sleepRes.error || activityRes.error || hydrationRes.error || nutritionRes.error) {
            throw new Error('Error fetching weekly data');
        }

        // Calculate averages
        const sleepData = sleepRes.data || [];
        const activityData = activityRes.data || [];
        const hydrationData = hydrationRes.data || [];
        const nutritionData = nutritionRes.data || [];

        const avgSleep = sleepData.length > 0
            ? sleepData.reduce((sum, e) => sum + e.duration_hours, 0) / sleepData.length
            : 0;

        const avgSteps = activityData.length > 0
            ? activityData.reduce((sum, e) => sum + (e.steps || 0), 0) / activityData.length
            : 0;

        const avgHydration = hydrationData.length > 0
            ? hydrationData.reduce((sum, e) => sum + e.cups_consumed, 0) / hydrationData.length
            : 0;

        const avgCalories = nutritionData.length > 0
            ? nutritionData.reduce((sum, e) => sum + e.calories, 0) / nutritionData.length
            : 0;

        // Calculate progress (assuming targets)
        const sleepTarget = 8;
        const stepsTarget = 10000;
        const hydrationTarget = 10;
        const caloriesTarget = 2000;

        const stats: WeeklyStats = {
            avgSleep: Math.round(avgSleep * 10) / 10,
            avgSteps: Math.round(avgSteps),
            avgHydration: Math.round(avgHydration * 10) / 10,
            avgCalories: Math.round(avgCalories),
            sleepProgress: Math.min(100, Math.round((avgSleep / sleepTarget) * 100)),
            stepsProgress: Math.min(100, Math.round((avgSteps / stepsTarget) * 100)),
            hydrationProgress: Math.min(100, Math.round((avgHydration / hydrationTarget) * 100)),
            caloriesProgress: Math.min(100, Math.round((avgCalories / caloriesTarget) * 100)),
        };

        return { data: stats, error: null };
    } catch (error) {
        console.error('Error calculating weekly stats:', error);
        return { data: null, error };
    }
}

export async function getWeeklyChartData(userId: string) {
    try {
        const [sleepRes, activityRes, hydrationRes, nutritionRes] = await Promise.all([
            getSleepHistory(userId, 7),
            getActivityHistory(userId, 7),
            getHydrationHistory(userId, 7),
            getNutritionHistory(userId, 7),
        ]);

        if (sleepRes.error || activityRes.error || hydrationRes.error || nutritionRes.error) {
            throw new Error('Error fetching weekly chart data');
        }

        // Create a map for the last 7 days
        const chartData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];

            const sleepEntry = sleepRes.data?.find(e => e.date === dateStr);
            const activityEntry = activityRes.data?.find(e => e.date === dateStr);
            const hydrationEntry = hydrationRes.data?.find(e => e.date === dateStr);

            // Sum all nutrition entries for the day
            const nutritionEntries = nutritionRes.data?.filter(e => e.date === dateStr) || [];
            const totalCalories = nutritionEntries.reduce((sum, e) => sum + e.calories, 0);

            chartData.push({
                day: dayName,
                sleep: sleepEntry?.duration_hours || 0,
                steps: activityEntry?.steps || 0,
                water: hydrationEntry?.cups_consumed || 0,
                calories: totalCalories || 0,
            });
        }

        return { data: chartData, error: null };
    } catch (error) {
        console.error('Error fetching weekly chart data:', error);
        return { data: null, error };
    }
}

export async function saveDailyCheckIn(userId: string, checkInData: DailyCheckIn) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const results = [];

        // Save sleep data
        if (checkInData.sleep) {
            const sleepResult = await saveSleepEntry({
                user_id: userId,
                date: today,
                ...checkInData.sleep,
            } as SleepEntry);
            results.push(sleepResult);
        }

        // Save activity data
        if (checkInData.activity) {
            const activityResult = await saveActivityEntry({
                user_id: userId,
                date: today,
                ...checkInData.activity,
            } as ActivityEntry);
            results.push(activityResult);
        }

        // Save hydration data
        if (checkInData.hydration) {
            const hydrationResult = await saveHydrationEntry({
                user_id: userId,
                date: today,
                ...checkInData.hydration,
            } as HydrationEntry);
            results.push(hydrationResult);
        }

        // Save nutrition entries
        if (checkInData.nutrition && checkInData.nutrition.length > 0) {
            for (const nutrition of checkInData.nutrition) {
                const nutritionResult = await saveNutritionEntry({
                    user_id: userId,
                    date: today,
                    ...nutrition,
                } as NutritionEntry);
                results.push(nutritionResult);
            }
        }

        // Check if any errors occurred
        const hasError = results.some(r => r.error);
        if (hasError) {
            throw new Error('Some entries failed to save');
        }

        return { data: results, error: null };
    } catch (error) {
        console.error('Error saving daily check-in:', error);
        return { data: null, error };
    }
}

export async function generateRecommendations(userId: string) {
    try {
        const { data: stats, error } = await getWeeklyStats(userId);

        if (error || !stats) {
            return { data: [], error };
        }

        const recommendations = [];

        // Sleep recommendations
        if (stats.avgSleep < 7) {
            recommendations.push({
                title: 'Improve Sleep Quality',
                description: 'Try going to bed 30 minutes earlier on weeknights',
                priority: 'high',
                category: 'sleep',
            });
        }

        // Activity recommendations
        if (stats.avgSteps < 8000) {
            recommendations.push({
                title: 'Increase Step Count',
                description: 'Take a 15-minute walk after lunch to boost daily steps',
                priority: stats.avgSteps < 5000 ? 'high' : 'medium',
                category: 'exercise',
            });
        }

        // Hydration recommendations
        if (stats.avgHydration < 8) {
            recommendations.push({
                title: 'Stay Hydrated',
                description: 'Set reminders to drink water throughout the day',
                priority: 'medium',
                category: 'hydration',
            });
        }

        // Nutrition recommendations
        if (stats.avgCalories > 2500) {
            recommendations.push({
                title: 'Monitor Calorie Intake',
                description: 'Consider portion control and healthier meal options',
                priority: 'medium',
                category: 'nutrition',
            });
        } else if (stats.avgCalories < 1500) {
            recommendations.push({
                title: 'Ensure Adequate Nutrition',
                description: 'Make sure you\'re eating enough to fuel your body',
                priority: 'high',
                category: 'nutrition',
            });
        }

        return { data: recommendations, error: null };
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return { data: [], error };
    }
}
