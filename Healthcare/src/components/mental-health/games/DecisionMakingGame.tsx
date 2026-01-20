import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveDecisionMakingData } from '@/services/gameDataService';

interface Choice {
    option: 'safe' | 'risky';
    safeReward: number;
    riskyReward: number;
    riskyProbability: number;
}

interface DecisionMakingGameProps {
    userId?: string;
    onComplete?: () => void;
}

export function DecisionMakingGame({ userId, onComplete }: DecisionMakingGameProps) {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
    const [currentChoice, setCurrentChoice] = useState<Choice | null>(null);
    const [decisionNumber, setDecisionNumber] = useState(0);
    const [results, setResults] = useState({
        totalDecisions: 0,
        riskyChoices: 0,
        safeChoices: 0,
        decisions: [] as { choice: 'safe' | 'risky'; reward: number; regret: boolean }[],
        changedMind: 0
    });
    const [selectedOption, setSelectedOption] = useState<'safe' | 'risky' | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [lastReward, setLastReward] = useState(0);

    const { toast } = useToast();
    const TOTAL_DECISIONS = 10;

    useEffect(() => {
        if (gameState === 'playing' && !currentChoice) {
            generateChoice();
        }
    }, [gameState, currentChoice]);

    const generateChoice = () => {
        const safeReward = Math.floor(Math.random() * 30) + 20; // 20-50 points
        const riskyReward = Math.floor(Math.random() * 80) + 40; // 40-120 points
        const riskyProbability = Math.random() * 0.6 + 0.2; // 20-80% chance

        setCurrentChoice({
            option: 'safe',
            safeReward,
            riskyReward,
            riskyProbability
        });
        setSelectedOption(null);
        setShowResult(false);
    };

    const handleSelection = (option: 'safe' | 'risky') => {
        if (showResult) return;

        if (selectedOption && selectedOption !== option) {
            setResults(prev => ({ ...prev, changedMind: prev.changedMind + 1 }));
        }

        setSelectedOption(option);
    };

    const confirmDecision = () => {
        if (!selectedOption || !currentChoice) return;

        let actualReward = 0;
        let regret = false;

        if (selectedOption === 'safe') {
            actualReward = currentChoice.safeReward;
        } else {
            // Determine if risky choice succeeds
            const success = Math.random() < currentChoice.riskyProbability;
            actualReward = success ? currentChoice.riskyReward : 0;
            regret = !success;
        }

        setLastReward(actualReward);
        setShowResult(true);

        const newResults = { ...results };
        newResults.totalDecisions++;
        if (selectedOption === 'risky') {
            newResults.riskyChoices++;
        } else {
            newResults.safeChoices++;
        }
        newResults.decisions.push({
            choice: selectedOption,
            reward: actualReward,
            regret
        });

        setResults(newResults);

        setTimeout(() => {
            if (decisionNumber + 1 >= TOTAL_DECISIONS) {
                completeGame(newResults);
            } else {
                setDecisionNumber(decisionNumber + 1);
                setCurrentChoice(null);
            }
        }, 2000);
    };

    const completeGame = async (finalResults: typeof results) => {
        setGameState('complete');

        if (!userId) return;

        const riskPreference = ((finalResults.riskyChoices - finalResults.safeChoices) / finalResults.totalDecisions) * 100;

        // Calculate regret behavior
        const regretBehavior = {
            total_regrets: finalResults.decisions.filter(d => d.regret).length,
            regret_rate: (finalResults.decisions.filter(d => d.regret).length / finalResults.riskyChoices) * 100,
            changed_mind_count: finalResults.changedMind
        };

        // Calculate decision consistency
        const firstHalf = finalResults.decisions.slice(0, Math.floor(TOTAL_DECISIONS / 2));
        const secondHalf = finalResults.decisions.slice(Math.floor(TOTAL_DECISIONS / 2));
        const firstHalfRisk = firstHalf.filter(d => d.choice === 'risky').length / firstHalf.length;
        const secondHalfRisk = secondHalf.filter(d => d.choice === 'risky').length / secondHalf.length;
        const consistency = 100 - (Math.abs(firstHalfRisk - secondHalfRisk) * 100);

        try {
            await saveDecisionMakingData({
                user_id: userId,
                total_decisions: finalResults.totalDecisions,
                risky_choices: finalResults.riskyChoices,
                safe_choices: finalResults.safeChoices,
                risk_preference_score: riskPreference,
                regret_behavior: regretBehavior,
                decision_consistency: consistency
            });

            toast({
                title: "Game Complete!",
                description: `You made ${finalResults.totalDecisions} decisions!`
            });
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const startGame = () => {
        setGameState('playing');
        setDecisionNumber(0);
        setResults({
            totalDecisions: 0,
            riskyChoices: 0,
            safeChoices: 0,
            decisions: [],
            changedMind: 0
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
                    <div className="w-20 h-20 mx-auto bg-coral/10 rounded-full flex items-center justify-center">
                        <Scale className="w-10 h-10 text-coral" />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-foreground">
                        Decision Making Game
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Choose between safe and risky rewards. This reveals your risk-taking patterns and decision-making style.
                    </p>
                </div>

                <div className="bg-muted rounded-xl p-6 space-y-3">
                    <h4 className="font-semibold text-foreground">How to Play:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-coral">•</span>
                            <span>Choose between a guaranteed safe reward or a risky gamble</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-coral">•</span>
                            <span>Risky choices have higher rewards but may fail</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-coral">•</span>
                            <span>You can change your mind before confirming</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-coral">•</span>
                            <span>Make {TOTAL_DECISIONS} decisions</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={startGame}
                    className="w-full bg-coral text-white hover:bg-coral/90"
                    size="lg"
                >
                    Start Game
                </Button>
            </motion.div>
        );
    }

    if (gameState === 'playing' && currentChoice) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Decision {decisionNumber + 1} of {TOTAL_DECISIONS}</span>
                        <span>Total: {results.decisions.reduce((sum, d) => sum + d.reward, 0)} points</span>
                    </div>
                    <Progress value={((decisionNumber + 1) / TOTAL_DECISIONS) * 100} className="h-2" />
                </div>

                <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Choose Your Reward</h4>
                    <p className="text-sm text-muted-foreground">Select an option, then confirm your decision</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Safe Option */}
                    <motion.button
                        onClick={() => handleSelection('safe')}
                        disabled={showResult}
                        className={cn(
                            "p-6 rounded-xl border-2 transition-all",
                            selectedOption === 'safe'
                                ? "border-success bg-success/10"
                                : "border-border hover:border-success/50"
                        )}
                        whileHover={{ scale: showResult ? 1 : 1.02 }}
                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-success">Safe Choice</span>
                            <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-foreground mb-2">
                                {currentChoice.safeReward}
                            </p>
                            <p className="text-sm text-muted-foreground">Guaranteed Points</p>
                        </div>
                    </motion.button>

                    {/* Risky Option */}
                    <motion.button
                        onClick={() => handleSelection('risky')}
                        disabled={showResult}
                        className={cn(
                            "p-6 rounded-xl border-2 transition-all",
                            selectedOption === 'risky'
                                ? "border-coral bg-coral/10"
                                : "border-border hover:border-coral/50"
                        )}
                        whileHover={{ scale: showResult ? 1 : 1.02 }}
                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-coral">Risky Choice</span>
                            <TrendingDown className="w-5 h-5 text-coral" />
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-foreground mb-2">
                                {currentChoice.riskyReward}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {(currentChoice.riskyProbability * 100).toFixed(0)}% chance
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                (0 points if failed)
                            </p>
                        </div>
                    </motion.button>
                </div>

                {!showResult && selectedOption && (
                    <Button
                        onClick={confirmDecision}
                        className="w-full bg-coral text-white hover:bg-coral/90"
                        size="lg"
                    >
                        Confirm {selectedOption === 'safe' ? 'Safe' : 'Risky'} Choice
                    </Button>
                )}

                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "p-6 rounded-xl text-center",
                            lastReward > 0 ? "bg-success/10 border border-success" : "bg-destructive/10 border border-destructive"
                        )}
                    >
                        <p className="text-3xl font-bold mb-2" style={{ color: lastReward > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                            {lastReward > 0 ? `+${lastReward} points!` : 'No points'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {lastReward > 0 ? 'Great choice!' : 'Better luck next time!'}
                        </p>
                    </motion.div>
                )}
            </div>
        );
    }

    if (gameState === 'complete') {
        const totalPoints = results.decisions.reduce((sum, d) => sum + d.reward, 0);
        const riskRate = (results.riskyChoices / results.totalDecisions) * 100;

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
                        Decisions Complete!
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
                        <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{riskRate.toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Risk Rate</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{results.riskyChoices}</p>
                        <p className="text-sm text-muted-foreground">Risky Choices</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{results.changedMind}</p>
                        <p className="text-sm text-muted-foreground">Changed Mind</p>
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
                        className="flex-1 bg-coral text-white hover:bg-coral/90"
                    >
                        Done
                    </Button>
                </div>
            </motion.div>
        );
    }

    return null;
}
