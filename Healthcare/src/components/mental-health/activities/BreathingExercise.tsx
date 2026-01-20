import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveBreathingSession } from '@/services/guidedActivityService';

const BREATHING_PHASES = [
    { phase: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose', color: 'text-primary' },
    { phase: 'Hold', duration: 4, instruction: 'Hold your breath gently', color: 'text-warning' },
    { phase: 'Exhale', duration: 6, instruction: 'Breathe out slowly through your mouth', color: 'text-success' },
    { phase: 'Rest', duration: 2, instruction: 'Rest and prepare for the next breath', color: 'text-muted-foreground' },
];

interface BreathingExerciseProps {
    userId?: string;
    onComplete?: () => void;
}

export function BreathingExercise({ userId, onComplete }: BreathingExerciseProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [phaseProgress, setPhaseProgress] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [targetDuration, setTargetDuration] = useState([300]); // 5 minutes default
    const [stressBefore, setStressBefore] = useState<number | null>(null);
    const [stressAfter, setStressAfter] = useState<number | null>(null);
    const [showStressCheck, setShowStressCheck] = useState<'before' | 'after' | null>('before');
    const { toast } = useToast();

    const currentPhase = BREATHING_PHASES[currentPhaseIndex];

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setPhaseProgress(prev => {
                if (prev >= currentPhase.duration) {
                    setCurrentPhaseIndex((prevIndex) => (prevIndex + 1) % BREATHING_PHASES.length);
                    return 0;
                }
                return prev + 0.1;
            });

            setTotalDuration(prev => {
                const newDuration = prev + 0.1;
                if (newDuration >= targetDuration[0]) {
                    handleComplete();
                    return prev;
                }
                return newDuration;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, currentPhaseIndex, currentPhase.duration]);

    const handleStart = () => {
        if (stressBefore === null) {
            toast({
                title: "Rate your stress",
                description: "Please rate your stress level before starting",
                variant: "destructive"
            });
            return;
        }
        setShowStressCheck(null);
        setIsPlaying(true);
    };

    const handleComplete = () => {
        setIsPlaying(false);
        setShowStressCheck('after');
    };

    const handleSave = async () => {
        if (!userId || stressBefore === null || stressAfter === null) return;

        try {
            await saveBreathingSession({
                user_id: userId,
                session_duration: Math.round(totalDuration),
                target_duration: targetDuration[0],
                completed: totalDuration >= targetDuration[0],
                drop_off_time: totalDuration < targetDuration[0] ? Math.round(totalDuration) : undefined,
                completion_rate: (totalDuration / targetDuration[0]) * 100,
                stress_before: stressBefore,
                stress_after: stressAfter
            });

            toast({
                title: "Session Saved!",
                description: `Great work! You reduced stress by ${stressBefore - stressAfter} points`
            });

            onComplete?.();
        } catch (error) {
            console.error('Error saving breathing session:', error);
            toast({
                title: "Error",
                description: "Failed to save session",
                variant: "destructive"
            });
        }
    };

    if (showStressCheck === 'before') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Wind className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-foreground">
                        Breathing Exercise
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Before we begin, how stressed do you feel right now?
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-2">{stressBefore || 5}</p>
                        <p className="text-sm text-muted-foreground">Stress Level (1-10)</p>
                    </div>

                    <Slider
                        value={[stressBefore || 5]}
                        onValueChange={(val) => setStressBefore(val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 - Calm</span>
                        <span>10 - Very Stressed</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Session Duration</label>
                    <div className="flex gap-2">
                        {[180, 300, 600].map((duration) => (
                            <Button
                                key={duration}
                                variant={targetDuration[0] === duration ? "default" : "outline"}
                                onClick={() => setTargetDuration([duration])}
                                className="flex-1"
                            >
                                {duration / 60} min
                            </Button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleStart}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exercise
                </Button>
            </motion.div>
        );
    }

    if (showStressCheck === 'after') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                        <Wind className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Well Done!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        How stressed do you feel now?
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-2">{stressAfter || 5}</p>
                        <p className="text-sm text-muted-foreground">Stress Level (1-10)</p>
                    </div>

                    <Slider
                        value={[stressAfter || 5]}
                        onValueChange={(val) => setStressAfter(val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                    />
                </div>

                {stressBefore !== null && stressAfter !== null && (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Stress Reduction</p>
                        <p className="text-3xl font-bold text-success">
                            {stressBefore - stressAfter > 0 ? '-' : '+'}{Math.abs(stressBefore - stressAfter)} points
                        </p>
                    </div>
                )}

                <Button
                    onClick={handleSave}
                    disabled={stressAfter === null}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Session
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')} / {targetDuration[0] / 60}:00</span>
                </div>
                <Progress value={(totalDuration / targetDuration[0]) * 100} className="h-2" />
            </div>

            <motion.div
                key={currentPhaseIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6 py-12"
            >
                <div className={cn("text-6xl font-bold", currentPhase.color)}>
                    {currentPhase.phase}
                </div>

                <div className="relative w-48 h-48 mx-auto">
                    <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        animate={{
                            scale: currentPhase.phase === 'Inhale' ? [1, 1.3] : currentPhase.phase === 'Exhale' ? [1.3, 1] : 1
                        }}
                        transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-foreground">
                            {Math.ceil(currentPhase.duration - phaseProgress)}
                        </span>
                    </div>
                </div>

                <p className="text-lg text-muted-foreground">{currentPhase.instruction}</p>
            </motion.div>

            <div className="flex gap-3">
                <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="outline"
                    className="flex-1"
                >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Resume'}
                </Button>
                <Button
                    onClick={() => {
                        setIsPlaying(false);
                        setTotalDuration(0);
                        setCurrentPhaseIndex(0);
                        setPhaseProgress(0);
                    }}
                    variant="outline"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
