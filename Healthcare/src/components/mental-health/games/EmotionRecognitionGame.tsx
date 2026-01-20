import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, Angry, Heart, Zap, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveEmotionRecognitionData } from '@/services/gameDataService';

// Emotion options with emojis and labels
const EMOTIONS = [
    { id: 'happy', label: 'Happy', emoji: '😊', icon: Smile, color: 'text-success' },
    { id: 'sad', label: 'Sad', emoji: '😢', icon: Frown, color: 'text-primary' },
    { id: 'angry', label: 'Angry', emoji: '😠', icon: Angry, color: 'text-destructive' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', icon: Meh, color: 'text-muted-foreground' },
    { id: 'excited', label: 'Excited', emoji: '🤩', icon: Zap, color: 'text-warning' },
    { id: 'love', label: 'Love', emoji: '😍', icon: Heart, color: 'text-coral' },
];

interface EmotionQuestion {
    correctEmotion: typeof EMOTIONS[number];
    displayEmoji: string;
    startTime: number;
}

interface GameResult {
    totalQuestions: number;
    correctAnswers: number;
    reactionTimes: number[];
    confusionMatrix: Record<string, Record<string, number>>;
    emotionBreakdown: Record<string, { correct: number; total: number }>;
}

interface EmotionRecognitionGameProps {
    userId?: string;
    onComplete?: () => void;
}

export function EmotionRecognitionGame({ userId, onComplete }: EmotionRecognitionGameProps) {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
    const [currentQuestion, setCurrentQuestion] = useState<EmotionQuestion | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [result, setResult] = useState<GameResult>({
        totalQuestions: 0,
        correctAnswers: 0,
        reactionTimes: [],
        confusionMatrix: {},
        emotionBreakdown: {}
    });
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);

    const { toast } = useToast();
    const TOTAL_QUESTIONS = 12;

    useEffect(() => {
        if (gameState === 'playing' && !currentQuestion) {
            generateQuestion();
        }
    }, [gameState, currentQuestion]);

    const generateQuestion = () => {
        const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        setCurrentQuestion({
            correctEmotion: randomEmotion,
            displayEmoji: randomEmotion.emoji,
            startTime: Date.now()
        });
        setSelectedEmotion(null);
    };

    const handleEmotionSelect = async (emotionId: string) => {
        if (isAnswering || !currentQuestion) return;

        setIsAnswering(true);
        setSelectedEmotion(emotionId);

        const reactionTime = Date.now() - currentQuestion.startTime;
        const isCorrect = emotionId === currentQuestion.correctEmotion.id;

        // Update result
        const newResult = { ...result };
        newResult.totalQuestions++;
        if (isCorrect) newResult.correctAnswers++;
        newResult.reactionTimes.push(reactionTime);

        // Update confusion matrix
        const correct = currentQuestion.correctEmotion.id;
        if (!newResult.confusionMatrix[correct]) {
            newResult.confusionMatrix[correct] = {};
        }
        newResult.confusionMatrix[correct][emotionId] =
            (newResult.confusionMatrix[correct][emotionId] || 0) + 1;

        // Update emotion breakdown
        if (!newResult.emotionBreakdown[correct]) {
            newResult.emotionBreakdown[correct] = { correct: 0, total: 0 };
        }
        newResult.emotionBreakdown[correct].total++;
        if (isCorrect) {
            newResult.emotionBreakdown[correct].correct++;
        }

        setResult(newResult);

        // Wait a moment to show selection
        await new Promise(resolve => setTimeout(resolve, 500));

        // Move to next question or complete
        if (questionNumber + 1 >= TOTAL_QUESTIONS) {
            completeGame(newResult);
        } else {
            setQuestionNumber(questionNumber + 1);
            setCurrentQuestion(null);
            setIsAnswering(false);
        }
    };

    const completeGame = async (finalResult: GameResult) => {
        setGameState('complete');

        if (!userId) return;

        // Calculate metrics
        const accuracyRate = (finalResult.correctAnswers / finalResult.totalQuestions) * 100;
        const avgReactionTime = finalResult.reactionTimes.reduce((a, b) => a + b, 0) / finalResult.reactionTimes.length;

        // Calculate negative emotion bias
        const negativeEmotions = ['sad', 'angry'];
        let negativeSelections = 0;
        Object.values(finalResult.confusionMatrix).forEach(selections => {
            negativeEmotions.forEach(neg => {
                negativeSelections += selections[neg] || 0;
            });
        });
        const negativeEmotionBias = (negativeSelections / finalResult.totalQuestions) * 100;

        // Calculate emotion-specific accuracy
        const emotionBreakdown: Record<string, number> = {};
        Object.entries(finalResult.emotionBreakdown).forEach(([emotion, stats]) => {
            emotionBreakdown[emotion] = (stats.correct / stats.total) * 100;
        });

        // Save to database
        try {
            await saveEmotionRecognitionData({
                user_id: userId,
                total_questions: finalResult.totalQuestions,
                correct_answers: finalResult.correctAnswers,
                accuracy_rate: accuracyRate,
                average_reaction_time: Math.round(avgReactionTime),
                negative_emotion_bias: negativeEmotionBias,
                confusion_matrix: finalResult.confusionMatrix,
                emotion_breakdown: emotionBreakdown
            });

            toast({
                title: "Game Complete!",
                description: `You scored ${accuracyRate.toFixed(0)}% accuracy!`
            });
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const startGame = () => {
        setGameState('playing');
        setQuestionNumber(0);
        setResult({
            totalQuestions: 0,
            correctAnswers: 0,
            reactionTimes: [],
            confusionMatrix: {},
            emotionBreakdown: {}
        });
    };

    const restartGame = () => {
        setGameState('intro');
        setCurrentQuestion(null);
    };

    if (gameState === 'intro') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-purple/10 rounded-full flex items-center justify-center">
                        <Smile className="w-10 h-10 text-purple" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Emotion Recognition Game
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Identify emotions as quickly and accurately as you can. This helps us understand your emotional perception and response patterns.
                    </p>
                </div>

                <div className="bg-muted rounded-xl p-6 space-y-3">
                    <h4 className="font-semibold text-foreground">How to Play:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-purple">•</span>
                            <span>You'll see an emoji representing an emotion</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple">•</span>
                            <span>Select the correct emotion as quickly as possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple">•</span>
                            <span>Complete {TOTAL_QUESTIONS} questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple">•</span>
                            <span>Your reaction time and accuracy will be measured</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={startGame}
                    className="w-full gradient-mental text-primary-foreground"
                    size="lg"
                >
                    Start Game
                </Button>
            </motion.div>
        );
    }

    if (gameState === 'playing' && currentQuestion) {
        return (
            <div className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Question {questionNumber + 1} of {TOTAL_QUESTIONS}</span>
                        <span>{result.correctAnswers} correct</span>
                    </div>
                    <Progress value={((questionNumber + 1) / TOTAL_QUESTIONS) * 100} className="h-2" />
                </div>

                {/* Emotion Display */}
                <motion.div
                    key={questionNumber}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                >
                    <div className="text-8xl mb-6">{currentQuestion.displayEmoji}</div>
                    <p className="text-lg text-muted-foreground">What emotion is this?</p>
                </motion.div>

                {/* Emotion Options */}
                <div className="grid grid-cols-2 gap-3">
                    {EMOTIONS.map((emotion) => (
                        <motion.button
                            key={emotion.id}
                            onClick={() => handleEmotionSelect(emotion.id)}
                            disabled={isAnswering}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                selectedEmotion === emotion.id
                                    ? emotion.id === currentQuestion.correctEmotion.id
                                        ? "border-success bg-success/10"
                                        : "border-destructive bg-destructive/10"
                                    : "border-border hover:border-purple/50 hover:bg-muted"
                            )}
                            whileHover={{ scale: isAnswering ? 1 : 1.02 }}
                            whileTap={{ scale: isAnswering ? 1 : 0.98 }}
                        >
                            <emotion.icon className={cn("w-6 h-6", emotion.color)} />
                            <span className="text-sm font-medium text-foreground">{emotion.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    if (gameState === 'complete') {
        const accuracyRate = (result.correctAnswers / result.totalQuestions) * 100;
        const avgReactionTime = result.reactionTimes.reduce((a, b) => a + b, 0) / result.reactionTimes.length;

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
                        Game Complete!
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{accuracyRate.toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{(avgReactionTime / 1000).toFixed(1)}s</p>
                        <p className="text-sm text-muted-foreground">Avg. Time</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{result.correctAnswers}/{result.totalQuestions}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                            {Math.min(...result.reactionTimes) / 1000}s
                        </p>
                        <p className="text-sm text-muted-foreground">Fastest</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={restartGame}
                        variant="outline"
                        className="flex-1"
                    >
                        Play Again
                    </Button>
                    <Button
                        onClick={onComplete}
                        className="flex-1 gradient-mental text-primary-foreground"
                    >
                        Done
                    </Button>
                </div>
            </motion.div>
        );
    }

    return null;
}
