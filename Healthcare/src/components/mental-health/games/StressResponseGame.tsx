import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveStressResponseData } from '@/services/gameDataService';

interface StressResponseGameProps {
    userId?: string;
    onComplete?: () => void;
}

interface Task {
    question: string;
    correctAnswer: number;
    options: number[];
}

export function StressResponseGame({ userId, onComplete }: StressResponseGameProps) {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [taskNumber, setTaskNumber] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [difficulty, setDifficulty] = useState(1);
    const [startTime, setStartTime] = useState(0);
    const [results, setResults] = useState({
        totalTasks: 0,
        correctAnswers: 0,
        errors: [] as { task: number; time: number; underPressure: boolean }[],
        responseTimes: [] as number[],
        performanceUnderPressure: [] as { task: number; correct: boolean; timeLeft: number }[]
    });

    const { toast } = useToast();
    const TOTAL_TASKS = 12;

    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 30;
                    }
                    // Increase difficulty as time runs low
                    if (prev === 15 && difficulty < 3) {
                        setDifficulty(d => d + 1);
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [gameState, taskNumber]);

    useEffect(() => {
        if (gameState === 'playing' && !currentTask) {
            generateTask();
        }
    }, [gameState, currentTask, difficulty]);

    const generateTask = () => {
        const a = Math.floor(Math.random() * (10 * difficulty)) + 1;
        const b = Math.floor(Math.random() * (10 * difficulty)) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * Math.min(difficulty, operations.length))];

        let correctAnswer: number;
        let question: string;

        switch (operation) {
            case '+':
                correctAnswer = a + b;
                question = `${a} + ${b} = ?`;
                break;
            case '-':
                correctAnswer = a - b;
                question = `${a} - ${b} = ?`;
                break;
            case '*':
                correctAnswer = a * b;
                question = `${a} × ${b} = ?`;
                break;
            default:
                correctAnswer = a + b;
                question = `${a} + ${b} = ?`;
        }

        // Generate options including correct answer
        const options = [correctAnswer];
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 10) - 5;
            const option = correctAnswer + offset;
            if (!options.includes(option) && option >= 0) {
                options.push(option);
            }
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        setCurrentTask({ question, correctAnswer, options });
        setStartTime(Date.now());
    };

    const handleAnswer = (answer: number) => {
        if (!currentTask) return;

        const responseTime = Date.now() - startTime;
        const isCorrect = answer === currentTask.correctAnswer;
        const underPressure = timeLeft < 10;

        const newResults = { ...results };
        newResults.totalTasks++;
        if (isCorrect) {
            newResults.correctAnswers++;
        } else {
            newResults.errors.push({
                task: taskNumber + 1,
                time: responseTime,
                underPressure
            });
        }
        newResults.responseTimes.push(responseTime);
        newResults.performanceUnderPressure.push({
            task: taskNumber + 1,
            correct: isCorrect,
            timeLeft
        });

        setResults(newResults);

        if (taskNumber + 1 >= TOTAL_TASKS) {
            completeGame(newResults);
        } else {
            setTaskNumber(taskNumber + 1);
            setCurrentTask(null);
            setTimeLeft(30);
        }
    };

    const handleTimeout = () => {
        if (!currentTask) return;

        const newResults = { ...results };
        newResults.totalTasks++;
        newResults.errors.push({
            task: taskNumber + 1,
            time: 30000,
            underPressure: true
        });
        newResults.performanceUnderPressure.push({
            task: taskNumber + 1,
            correct: false,
            timeLeft: 0
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

        const performanceScore = (finalResults.correctAnswers / finalResults.totalTasks) * 100;
        const avgResponseTime = finalResults.responseTimes.reduce((a, b) => a + b, 0) / finalResults.responseTimes.length;

        // Calculate error spikes (when errors occurred)
        const errorSpikes = {
            under_pressure: finalResults.errors.filter(e => e.underPressure).length,
            total_errors: finalResults.errors.length,
            error_times: finalResults.errors.map(e => e.task)
        };

        // Calculate stress tolerance (performance when time is low)
        const pressureTasks = finalResults.performanceUnderPressure.filter(p => p.timeLeft < 10);
        const pressureAccuracy = pressureTasks.length > 0
            ? (pressureTasks.filter(p => p.correct).length / pressureTasks.length) * 100
            : 100;

        // Recovery time (how quickly performance stabilizes after pressure)
        const recoveryTime = calculateRecoveryTime(finalResults.performanceUnderPressure);

        try {
            await saveStressResponseData({
                user_id: userId,
                difficulty_level: difficulty.toString(),
                performance_score: Math.round(performanceScore),
                error_spikes: errorSpikes,
                stress_tolerance_score: pressureAccuracy,
                recovery_time: recoveryTime
            });

            toast({
                title: "Game Complete!",
                description: `You scored ${performanceScore.toFixed(0)}% under pressure!`
            });
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const calculateRecoveryTime = (performance: typeof results.performanceUnderPressure): number => {
        let inPressure = false;
        let recoveryStart = 0;

        for (let i = 0; i < performance.length; i++) {
            if (performance[i].timeLeft < 10 && !inPressure) {
                inPressure = true;
                recoveryStart = i;
            } else if (performance[i].timeLeft >= 10 && inPressure) {
                return i - recoveryStart;
            }
        }

        return 0;
    };

    const startGame = () => {
        setGameState('playing');
        setTaskNumber(0);
        setTimeLeft(30);
        setDifficulty(1);
        setResults({
            totalTasks: 0,
            correctAnswers: 0,
            errors: [],
            responseTimes: [],
            performanceUnderPressure: []
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
                    <div className="w-20 h-20 mx-auto bg-warning/10 rounded-full flex items-center justify-center">
                        <Zap className="w-10 h-10 text-warning" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Stress Response Game
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Solve math problems under time pressure. This measures how you perform under stress and your stress tolerance.
                    </p>
                </div>

                <div className="bg-muted rounded-xl p-6 space-y-3">
                    <h4 className="font-semibold text-foreground">How to Play:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-warning">•</span>
                            <span>Solve math problems as quickly as possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-warning">•</span>
                            <span>You have 30 seconds per question</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-warning">•</span>
                            <span>Difficulty increases as time runs low</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-warning">•</span>
                            <span>Stay calm under pressure!</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={startGame}
                    className="w-full bg-warning text-white hover:bg-warning/90"
                    size="lg"
                >
                    Start Game
                </Button>
            </motion.div>
        );
    }

    if (gameState === 'playing' && currentTask) {
        const pressureLevel = timeLeft < 10 ? 'high' : timeLeft < 20 ? 'medium' : 'low';

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Question {taskNumber + 1} of {TOTAL_TASKS}</span>
                        <span className="flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            <span className={cn(
                                "font-bold",
                                timeLeft < 10 ? "text-destructive" : timeLeft < 20 ? "text-warning" : "text-foreground"
                            )}>
                                {timeLeft}s
                            </span>
                        </span>
                    </div>
                    <Progress
                        value={(timeLeft / 30) * 100}
                        className={cn(
                            "h-2",
                            timeLeft < 10 && "bg-destructive/20"
                        )}
                    />
                </div>

                {pressureLevel === 'high' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">High Pressure!</span>
                    </motion.div>
                )}

                <motion.div
                    key={taskNumber}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-muted rounded-xl p-12 text-center"
                >
                    <p className="text-5xl font-bold text-foreground">{currentTask.question}</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                    {currentTask.options.map((option, idx) => (
                        <Button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            variant="outline"
                            size="lg"
                            className="text-2xl font-bold h-16"
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    if (gameState === 'complete') {
        const accuracy = (results.correctAnswers / results.totalTasks) * 100;
        const pressureErrors = results.errors.filter(e => e.underPressure).length;

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
                        Well Done!
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{accuracy.toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{results.correctAnswers}/{results.totalTasks}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{pressureErrors}</p>
                        <p className="text-sm text-muted-foreground">Pressure Errors</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">Level {difficulty}</p>
                        <p className="text-sm text-muted-foreground">Max Difficulty</p>
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
                        className="flex-1 bg-warning text-white hover:bg-warning/90"
                    >
                        Done
                    </Button>
                </div>
            </motion.div>
        );
    }

    return null;
}
