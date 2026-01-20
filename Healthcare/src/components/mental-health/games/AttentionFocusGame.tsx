import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveAttentionFocusData } from '@/services/gameDataService';

type GameType = 'number_sequence' | 'stroop';

interface NumberSequenceTask {
    type: 'number_sequence';
    sequence: number[];
    correctAnswer: number;
}

interface StroopTask {
    type: 'stroop';
    word: string;
    color: string;
    correctAnswer: string;
}

type Task = NumberSequenceTask | StroopTask;

const COLORS = [
    { name: 'red', class: 'text-destructive', value: '#ef4444' },
    { name: 'blue', class: 'text-primary', value: '#3b82f6' },
    { name: 'green', class: 'text-success', value: '#10b981' },
    { name: 'yellow', class: 'text-warning', value: '#f59e0b' },
];

interface AttentionFocusGameProps {
    userId?: string;
    onComplete?: () => void;
}

export function AttentionFocusGame({ userId, onComplete }: AttentionFocusGameProps) {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
    const [gameType, setGameType] = useState<GameType>('number_sequence');
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [taskNumber, setTaskNumber] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [results, setResults] = useState({
        totalTasks: 0,
        errors: 0,
        impulsiveErrors: 0,
        responseTimes: [] as number[],
        abandonments: 0,
        performanceOverTime: [] as { task: number; correct: boolean; time: number }[]
    });

    const { toast } = useToast();
    const TOTAL_TASKS = 15;

    useEffect(() => {
        if (gameState === 'playing' && !currentTask) {
            generateTask();
        }
    }, [gameState, currentTask]);

    const generateTask = () => {
        const task: Task = Math.random() > 0.5 ? generateNumberSequence() : generateStroopTask();
        setCurrentTask(task);
        setStartTime(Date.now());
    };

    const generateNumberSequence = (): NumberSequenceTask => {
        const length = 4 + Math.floor(taskNumber / 3); // Increases difficulty
        const sequence: number[] = [];
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1);
        }
        const correctAnswer = sequence[Math.floor(Math.random() * sequence.length)];
        return { type: 'number_sequence', sequence, correctAnswer };
    };

    const generateStroopTask = (): StroopTask => {
        const word = COLORS[Math.floor(Math.random() * COLORS.length)].name;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)].name;
        return { type: 'stroop', word, color, correctAnswer: color };
    };

    const handleAnswer = (answer: number | string) => {
        if (!currentTask) return;

        const responseTime = Date.now() - startTime;
        const isCorrect = currentTask.type === 'number_sequence'
            ? answer === currentTask.correctAnswer
            : answer === currentTask.correctAnswer;

        const isImpulsive = responseTime < 500; // Less than 500ms is considered impulsive

        const newResults = { ...results };
        newResults.totalTasks++;
        if (!isCorrect) {
            newResults.errors++;
            if (isImpulsive) newResults.impulsiveErrors++;
        }
        newResults.responseTimes.push(responseTime);
        newResults.performanceOverTime.push({
            task: taskNumber + 1,
            correct: isCorrect,
            time: responseTime
        });

        setResults(newResults);

        if (taskNumber + 1 >= TOTAL_TASKS) {
            completeGame(newResults);
        } else {
            setTaskNumber(taskNumber + 1);
            setCurrentTask(null);
        }
    };

    const completeGame = async (finalResults: typeof results) => {
        setGameState('complete');

        if (!userId) return;

        const avgResponseTime = finalResults.responseTimes.reduce((a, b) => a + b, 0) / finalResults.responseTimes.length;

        // Calculate fatigue curve (performance degradation over time)
        const firstHalf = finalResults.performanceOverTime.slice(0, Math.floor(TOTAL_TASKS / 2));
        const secondHalf = finalResults.performanceOverTime.slice(Math.floor(TOTAL_TASKS / 2));
        const firstHalfAccuracy = firstHalf.filter(p => p.correct).length / firstHalf.length;
        const secondHalfAccuracy = secondHalf.filter(p => p.correct).length / secondHalf.length;

        const fatigueCurve = {
            first_half_accuracy: firstHalfAccuracy * 100,
            second_half_accuracy: secondHalfAccuracy * 100,
            degradation: (firstHalfAccuracy - secondHalfAccuracy) * 100
        };

        try {
            await saveAttentionFocusData({
                user_id: userId,
                game_type: 'mixed',
                total_tasks: finalResults.totalTasks,
                errors: finalResults.errors,
                impulsive_errors: finalResults.impulsiveErrors,
                average_response_time: Math.round(avgResponseTime),
                task_abandonment_count: finalResults.abandonments,
                fatigue_curve: fatigueCurve
            });

            toast({
                title: "Game Complete!",
                description: `${finalResults.totalTasks - finalResults.errors} correct out of ${finalResults.totalTasks}`
            });
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const startGame = (type: GameType) => {
        setGameType(type);
        setGameState('playing');
        setTaskNumber(0);
        setResults({
            totalTasks: 0,
            errors: 0,
            impulsiveErrors: 0,
            responseTimes: [],
            abandonments: 0,
            performanceOverTime: []
        });
    };

    if (gameState === 'intro') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Brain className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Attention & Focus Game
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Test your cognitive abilities with number sequences and color-word challenges. This measures attention, focus, and impulse control.
                    </p>
                </div>

                <div className="bg-muted rounded-xl p-6 space-y-3">
                    <h4 className="font-semibold text-foreground">How to Play:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Remember number sequences and identify specific numbers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Identify the COLOR of words, not what the word says</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Answer as quickly and accurately as possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>Complete {TOTAL_TASKS} tasks</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={() => startGame('number_sequence')}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                >
                    Start Game
                </Button>
            </motion.div>
        );
    }

    if (gameState === 'playing' && currentTask) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Task {taskNumber + 1} of {TOTAL_TASKS}</span>
                        <span>{results.totalTasks - results.errors} correct</span>
                    </div>
                    <Progress value={((taskNumber + 1) / TOTAL_TASKS) * 100} className="h-2" />
                </div>

                {currentTask.type === 'number_sequence' && (
                    <div className="space-y-6">
                        <motion.div
                            key={taskNumber}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-muted rounded-xl p-8 text-center"
                        >
                            <p className="text-sm text-muted-foreground mb-4">Remember this sequence:</p>
                            <div className="flex justify-center gap-3 text-4xl font-bold text-foreground">
                                {currentTask.sequence.map((num, idx) => (
                                    <span key={idx}>{num}</span>
                                ))}
                            </div>
                        </motion.div>

                        <div>
                            <p className="text-center text-muted-foreground mb-4">
                                Which number appeared in the sequence?
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {[...Array(9)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        onClick={() => handleAnswer(i + 1)}
                                        variant="outline"
                                        size="lg"
                                        className="text-xl font-bold"
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentTask.type === 'stroop' && (
                    <div className="space-y-6">
                        <motion.div
                            key={taskNumber}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-muted rounded-xl p-12 text-center"
                        >
                            <p className="text-sm text-muted-foreground mb-6">What COLOR is this word?</p>
                            <div className={cn(
                                "text-6xl font-bold uppercase",
                                COLORS.find(c => c.name === currentTask.color)?.class
                            )}>
                                {currentTask.word}
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-3">
                            {COLORS.map((color) => (
                                <Button
                                    key={color.name}
                                    onClick={() => handleAnswer(color.name)}
                                    variant="outline"
                                    size="lg"
                                    className="capitalize"
                                >
                                    {color.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (gameState === 'complete') {
        const accuracy = ((results.totalTasks - results.errors) / results.totalTasks) * 100;
        const avgTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Excellent Work!
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{accuracy.toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{(avgTime / 1000).toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">Avg. Time</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{results.impulsiveErrors}</p>
                        <p className="text-sm text-muted-foreground">Quick Errors</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{results.totalTasks - results.errors}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => setGameState('intro')}
                        variant="outline"
                        className="flex-1"
                    >
                        Play Again
                    </Button>
                    <Button
                        onClick={onComplete}
                        className="flex-1 gradient-primary text-primary-foreground"
                    >
                        Done
                    </Button>
                </div>
            </motion.div>
        );
    }

    return null;
}
