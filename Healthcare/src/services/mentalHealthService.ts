import { supabase } from '@/lib/supabase';

export interface MoodEntry {
    id?: string;
    user_id: string;
    mood_value: number;
    journal_entry?: string;
    created_at: string;
    updated_at?: string;
}

export interface WellnessActivity {
    id?: string;
    user_id: string;
    activity_type: string;
    duration: number;
    completed_at: string;
}

export interface MoodStats {
    stressLevel: number;
    anxiety: number;
    wellbeing: number;
}

/**
 * Save a mood entry to the database
 */
export async function saveMoodEntry(
    userId: string,
    moodValue: number,
    journalEntry?: string
): Promise<{ data: MoodEntry | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('mood_entries')
            .insert({
                user_id: userId,
                mood_value: moodValue,
                journal_entry: journalEntry,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error saving mood entry:', error);
        return { data: null, error };
    }
}

/**
 * Get mood entries for a user within a date range
 */
export async function getMoodEntries(
    userId: string,
    startDate?: Date,
    endDate?: Date
): Promise<{ data: MoodEntry[] | null; error: any }> {
    try {
        let query = supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }
        if (endDate) {
            query = query.lte('created_at', endDate.toISOString());
        }

        const { data, error } = await query;
        return { data, error };
    } catch (error) {
        console.error('Error fetching mood entries:', error);
        return { data: null, error };
    }
}

/**
 * Get the last 7 days of mood data for chart display
 */
export async function getWeeklyMoodData(
    userId: string
): Promise<{ day: string; mood: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await getMoodEntries(userId, sevenDaysAgo);

    if (error || !data) {
        return [];
    }

    // Group by day and calculate average mood
    const moodByDay: { [key: string]: number[] } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    data.forEach((entry) => {
        const date = new Date(entry.created_at);
        const dayName = days[date.getDay()];
        if (!moodByDay[dayName]) {
            moodByDay[dayName] = [];
        }
        moodByDay[dayName].push(entry.mood_value);
    });

    // Calculate averages and create chart data
    const chartData = days.map((day) => {
        const moods = moodByDay[day] || [];
        const avgMood = moods.length > 0
            ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)
            : 0;
        return { day, mood: avgMood };
    });

    return chartData;
}

/**
 * Calculate mental health statistics based on recent mood entries
 */
export async function getMoodStats(userId: string): Promise<MoodStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await getMoodEntries(userId, thirtyDaysAgo);

    if (error || !data || data.length === 0) {
        return {
            stressLevel: 0,
            anxiety: 0,
            wellbeing: 0,
        };
    }

    // Calculate average mood (1-5 scale)
    const avgMood = data.reduce((sum, entry) => sum + entry.mood_value, 0) / data.length;

    // Calculate mood variance (higher variance = more stress/anxiety)
    const variance = data.reduce((sum, entry) => {
        return sum + Math.pow(entry.mood_value - avgMood, 2);
    }, 0) / data.length;

    // Convert to percentage scales
    // Stress: higher variance = higher stress
    const stressLevel = Math.min(100, Math.round(variance * 20));

    // Anxiety: inverse of consistency (lower mood + higher variance = higher anxiety)
    const anxiety = Math.min(100, Math.round((6 - avgMood) * 15 + variance * 10));

    // Wellbeing: based on average mood (higher mood = higher wellbeing)
    const wellbeing = Math.round((avgMood / 5) * 100);

    return {
        stressLevel: Math.max(0, stressLevel),
        anxiety: Math.max(0, anxiety),
        wellbeing: Math.max(0, wellbeing),
    };
}

/**
 * Save a wellness activity
 */
export async function saveWellnessActivity(
    userId: string,
    activityType: string,
    duration: number
): Promise<{ data: WellnessActivity | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('wellness_activities')
            .insert({
                user_id: userId,
                activity_type: activityType,
                duration: duration,
                completed_at: new Date().toISOString(),
            })
            .select()
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error saving wellness activity:', error);
        return { data: null, error };
    }
}

/**
 * LocalStorage fallback functions for offline support
 */
const MOOD_ENTRIES_KEY = 'mental_health_mood_entries';

export function saveMoodEntryLocal(
    userId: string,
    moodValue: number,
    journalEntry?: string
): MoodEntry {
    const entries = getMoodEntriesLocal(userId);
    const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        user_id: userId,
        mood_value: moodValue,
        journal_entry: journalEntry,
        created_at: new Date().toISOString(),
    };

    entries.push(newEntry);
    localStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
}

export function getMoodEntriesLocal(userId: string): MoodEntry[] {
    try {
        const stored = localStorage.getItem(MOOD_ENTRIES_KEY);
        if (!stored) return [];

        const allEntries: MoodEntry[] = JSON.parse(stored);
        return allEntries.filter(entry => entry.user_id === userId);
    } catch (error) {
        console.error('Error reading local mood entries:', error);
        return [];
    }
}

export function getWeeklyMoodDataLocal(userId: string): { day: string; mood: number }[] {
    const entries = getMoodEntriesLocal(userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = entries.filter(
        entry => new Date(entry.created_at) >= sevenDaysAgo
    );

    const moodByDay: { [key: string]: number[] } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    recentEntries.forEach((entry) => {
        const date = new Date(entry.created_at);
        const dayName = days[date.getDay()];
        if (!moodByDay[dayName]) {
            moodByDay[dayName] = [];
        }
        moodByDay[dayName].push(entry.mood_value);
    });

    return days.map((day) => {
        const moods = moodByDay[day] || [];
        const avgMood = moods.length > 0
            ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)
            : 0;
        return { day, mood: avgMood };
    });
}
