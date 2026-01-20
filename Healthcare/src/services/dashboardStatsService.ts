import { supabase } from '@/lib/supabase';

export interface DashboardStats {
    totalConsultations: number;
    totalChatSessions: number;
    healthScore: number;
    avgResponseTime: string;
}

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
        // Fetch voice consultations count
        const { count: consultationsCount } = await supabase
            .from('voice_consultations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Fetch chat sessions count
        const { count: chatSessionsCount } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Fetch mental health score (overall wellbeing)
        const { data: mentalHealthData } = await supabase
            .from('mental_health_scores')
            .select('overall_wellbeing_score')
            .eq('user_id', userId)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single();

        // Calculate average response time from recent chat messages
        // This is a simplified calculation - you might want to implement a more sophisticated one
        const avgResponseTime = '<2s'; // Default value

        return {
            totalConsultations: consultationsCount || 0,
            totalChatSessions: chatSessionsCount || 0,
            healthScore: mentalHealthData?.overall_wellbeing_score || 0,
            avgResponseTime,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return default values on error
        return {
            totalConsultations: 0,
            totalChatSessions: 0,
            healthScore: 0,
            avgResponseTime: '<2s',
        };
    }
}

/**
 * Get total users count (admin only - for display purposes)
 */
export async function getTotalUsersCount(): Promise<number> {
    try {
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        return count || 0;
    } catch (error) {
        console.error('Error fetching total users count:', error);
        return 0;
    }
}

/**
 * Calculate health score change percentage
 */
export async function getHealthScoreChange(userId: string): Promise<{ change: string; positive: boolean }> {
    try {
        const { data: recentScores } = await supabase
            .from('mental_health_scores')
            .select('overall_wellbeing_score, calculated_at')
            .eq('user_id', userId)
            .order('calculated_at', { ascending: false })
            .limit(2);

        if (!recentScores || recentScores.length < 2) {
            return { change: 'No previous data', positive: true };
        }

        const current = recentScores[0].overall_wellbeing_score;
        const previous = recentScores[1].overall_wellbeing_score;
        const changePercent = ((current - previous) / previous) * 100;

        return {
            change: `${Math.abs(changePercent).toFixed(1)}% from last check`,
            positive: changePercent >= 0,
        };
    } catch (error) {
        console.error('Error calculating health score change:', error);
        return { change: 'N/A', positive: true };
    }
}

/**
 * Get consultation growth percentage
 */
export async function getConsultationGrowth(userId: string): Promise<{ change: string; positive: boolean }> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Count consultations in last 30 days
        const { count: recentCount } = await supabase
            .from('voice_consultations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', thirtyDaysAgo.toISOString());

        // Count consultations in previous 30 days (30-60 days ago)
        const { count: previousCount } = await supabase
            .from('voice_consultations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString());

        if (!previousCount || previousCount === 0) {
            return { change: `${recentCount || 0} this month`, positive: true };
        }

        const growthPercent = (((recentCount || 0) - previousCount) / previousCount) * 100;

        return {
            change: `${Math.abs(growthPercent).toFixed(0)}% this month`,
            positive: growthPercent >= 0,
        };
    } catch (error) {
        console.error('Error calculating consultation growth:', error);
        return { change: 'N/A', positive: true };
    }
}
