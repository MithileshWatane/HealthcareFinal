import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveDailyMood } from '@/services/dailyCheckInService';

const MOOD_EMOJIS = [
    { range: [0, 20], emoji: '😢', label: 'Very Low', color: 'text-destructive' },
    { range: [21, 40], emoji: '😕', label: 'Low', color: 'text-coral' },
    { range: [41, 60], emoji: '😐', label: 'Okay', color: 'text-warning' },
    { range: [61, 80], emoji: '🙂', label: 'Good', color: 'text-primary' },
    { range: [81, 100], emoji: '😊', label: 'Great', color: 'text-success' },
];

interface MoodSliderProps {
    userId?: string;
    onComplete?: () => void;
}

export function MoodSlider({ userId, onComplete }: MoodSliderProps) {
    const [moodScore, setMoodScore] = useState([50]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const currentMood = MOOD_EMOJIS.find(
        m => moodScore[0] >= m.range[0] && moodScore[0] <= m.range[1]
    ) || MOOD_EMOJIS[2];

    const handleSave = async () => {
        if (!userId) {
            toast({
                title: "Please sign in",
                description: "You need to be signed in to save your mood",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveDailyMood({
                user_id: userId,
                mood_score: moodScore[0],
                mood_emoji: currentMood.emoji
            });

            toast({
                title: "Mood Saved!",
                description: `Your mood (${currentMood.label}) has been recorded`
            });

            onComplete?.();
        } catch (error) {
            console.error('Error saving mood:', error);
            toast({
                title: "Error",
                description: "Failed to save your mood. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="text-center space-y-4">
                <h3 className="font-display font-semibold text-xl text-foreground">
                    How are you feeling today?
                </h3>
                <p className="text-sm text-muted-foreground">
                    Move the slider to reflect your current mood
                </p>
            </div>

            {/* Mood Display */}
            <motion.div
                key={currentMood.emoji}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
            >
                <div className="text-8xl mb-4">{currentMood.emoji}</div>
                <p className={cn("text-2xl font-semibold", currentMood.color)}>
                    {currentMood.label}
                </p>
                <p className="text-4xl font-bold text-muted-foreground mt-2">
                    {moodScore[0]}
                </p>
            </motion.div>

            {/* Slider */}
            <div className="space-y-4">
                <Slider
                    value={moodScore}
                    onValueChange={setMoodScore}
                    max={100}
                    step={1}
                    className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>😢 Very Low</span>
                    <span>😐 Okay</span>
                    <span>😊 Great</span>
                </div>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gradient-mental text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Mood'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why track mood?</strong> Daily mood tracking helps identify patterns and triggers over time.
                </p>
            </div>
        </motion.div>
    );
}
