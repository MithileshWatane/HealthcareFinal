import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Heart, Brain, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    getLatestScores,
    calculateAndSaveScores,
    interpretMoodStability,
    interpretStressResilience,
    interpretBurnoutRisk,
    interpretSocialConnection,
    interpretCognitiveFatigue,
    interpretOverallWellbeing,
    getRecommendations,
    type MentalHealthScores
} from '@/services/mentalHealthScoresService';

interface MentalHealthAnalyticsProps {
    userId: string;
}

export function MentalHealthAnalytics({ userId }: MentalHealthAnalyticsProps) {
    const [scores, setScores] = useState<MentalHealthScores | null>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        loadScores();
    }, [userId]);

    const loadScores = async () => {
        setLoading(true);
        try {
            const { data } = await getLatestScores(userId);
            setScores(data);
        } catch (error) {
            console.error('Error loading scores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateScores = async () => {
        setCalculating(true);
        try {
            const { data } = await calculateAndSaveScores(userId);
            setScores(data);
        } catch (error) {
            console.error('Error calculating scores:', error);
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!scores) {
        return (
            <Card className="p-12 text-center">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Analytics Yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Complete some activities and check-ins to generate your mental health analytics.
                </p>
                <Button
                    onClick={handleCalculateScores}
                    disabled={calculating}
                    className="gradient-mental text-primary-foreground"
                >
                    {calculating ? 'Calculating...' : 'Calculate Scores'}
                </Button>
            </Card>
        );
    }

    const moodStability = interpretMoodStability(scores.mood_stability_index);
    const stressResilience = interpretStressResilience(scores.stress_resilience_score);
    const burnoutRisk = interpretBurnoutRisk(scores.burnout_risk_score);
    const socialConnection = interpretSocialConnection(scores.social_connection_index);
    const cognitiveFatigue = interpretCognitiveFatigue(scores.cognitive_fatigue_score);
    const overallWellbeing = interpretOverallWellbeing(scores.overall_wellbeing_score);
    const recommendations = getRecommendations(scores);

    const scoreCards = [
        {
            title: 'Overall Wellbeing',
            score: scores.overall_wellbeing_score,
            interpretation: overallWellbeing,
            icon: Heart,
            gradient: 'gradient-mental'
        },
        {
            title: 'Mood Stability',
            score: scores.mood_stability_index,
            interpretation: moodStability,
            icon: Activity,
            gradient: 'gradient-primary'
        },
        {
            title: 'Stress Resilience',
            score: scores.stress_resilience_score,
            interpretation: stressResilience,
            icon: Zap,
            gradient: 'bg-success'
        },
        {
            title: 'Burnout Risk',
            score: scores.burnout_risk_score,
            interpretation: burnoutRisk,
            icon: AlertCircle,
            gradient: 'bg-warning',
            inverted: true
        },
        {
            title: 'Social Connection',
            score: scores.social_connection_index,
            interpretation: socialConnection,
            icon: Heart,
            gradient: 'bg-primary'
        },
        {
            title: 'Cognitive Fatigue',
            score: scores.cognitive_fatigue_score,
            interpretation: cognitiveFatigue,
            icon: Brain,
            gradient: 'bg-coral',
            inverted: true
        },
    ];

    return (
        <div className="space-y-6">
            {/* Overall Wellbeing - Featured */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="p-8 bg-gradient-to-br from-purple/10 to-primary/10 border-purple/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">
                                Overall Wellbeing
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Based on your recent activities and check-ins
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold text-foreground">
                                {Math.round(scores.overall_wellbeing_score)}
                            </div>
                            <div className={cn("text-sm font-medium", overallWellbeing.color)}>
                                {overallWellbeing.level}
                            </div>
                        </div>
                    </div>
                    <Progress value={scores.overall_wellbeing_score} className="h-3 mb-3" />
                    <p className="text-sm text-muted-foreground">{overallWellbeing.description}</p>
                </Card>
            </motion.div>

            {/* Individual Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoreCards.slice(1).map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${card.gradient} flex items-center justify-center`}>
                                        <card.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{card.title}</h4>
                                        <p className={cn("text-xs font-medium", card.interpretation.color)}>
                                            {card.interpretation.level}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {Math.round(card.score)}
                                </div>
                            </div>
                            <Progress
                                value={card.inverted ? 100 - card.score : card.score}
                                className="h-2 mb-2"
                            />
                            <p className="text-xs text-muted-foreground">
                                {card.interpretation.description}
                            </p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-6">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Personalized Recommendations
                        </h3>
                        <ul className="space-y-2">
                            {recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </motion.div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center">
                <Button
                    onClick={handleCalculateScores}
                    disabled={calculating}
                    variant="outline"
                >
                    {calculating ? 'Calculating...' : 'Refresh Analytics'}
                </Button>
            </div>
        </div>
    );
}
