import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gamepad2, Trophy, Clock, Target, Zap, Brain,
    RotateCcw, Play, Pause, Check, X, Music, Palette,
    Volume2, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { saveGameRecord } from "@/services/analyticsService";

interface GameProps {
    onComplete: (score: number, duration: number) => void;
    onClose: () => void;
}

// ============================================
// MEMORY MATCH GAME
// ============================================
const emojis = ['😊', '🌟', '❤️', '🌈', '🎵', '🌺', '☀️', '🦋'];

export function MemoryMatchGame({ onComplete, onClose }: GameProps) {
    const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [startTime] = useState(Date.now());
    const [gameWon, setGameWon] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const gameEmojis = [...emojis, ...emojis];
        const shuffled = gameEmojis
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji,
                flipped: false,
                matched: false,
            }));
        setCards(shuffled);
        setMoves(0);
        setMatches(0);
        setGameWon(false);
    };

    const handleCardClick = (index: number) => {
        if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) {
            return;
        }

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(moves + 1);
            const [first, second] = newFlipped;

            if (cards[first].emoji === cards[second].emoji) {
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[first].matched = true;
                    matchedCards[second].matched = true;
                    setCards(matchedCards);
                    setMatches(matches + 1);
                    setFlippedIndices([]);

                    if (matches + 1 === emojis.length) {
                        const duration = Math.floor((Date.now() - startTime) / 1000);
                        const score = Math.max(0, 1000 - (moves * 10) - (duration * 2));
                        setGameWon(true);
                        setTimeout(() => onComplete(score, duration), 1000);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[first].flipped = false;
                    resetCards[second].flipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Moves:</span>
                        <span className="ml-2 font-bold text-foreground">{moves}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Matches:</span>
                        <span className="ml-2 font-bold text-foreground">{matches}/{emojis.length}</span>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={initializeGame}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {cards.map((card, index) => (
                    <motion.button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={cn(
                            "aspect-square rounded-xl text-3xl flex items-center justify-center transition-all",
                            card.matched ? "bg-success/20 border-2 border-success" : "bg-muted hover:bg-muted/80",
                            card.flipped || card.matched ? "" : "cursor-pointer"
                        )}
                        whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                        whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
                    >
                        {card.flipped || card.matched ? card.emoji : "?"}
                    </motion.button>
                ))}
            </div>

            {gameWon && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 bg-success/10 rounded-xl border border-success"
                >
                    <Trophy className="w-12 h-12 text-success mx-auto mb-2" />
                    <p className="font-bold text-lg text-foreground">Congratulations!</p>
                    <p className="text-sm text-muted-foreground">You completed the game in {moves} moves!</p>
                </motion.div>
            )}
        </div>
    );
}

// ============================================
// BREATHING BUBBLE GAME
// ============================================
export function BreathingBubbleGame({ onComplete, onClose }: GameProps) {
    const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([]);
    const [score, setScore] = useState(0);
    const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            onComplete(score, duration);
        }
    }, [isPlaying, timeLeft]);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setBreathPhase(phase => phase === 'inhale' ? 'exhale' : 'inhale');
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                const newBubble = {
                    id: Date.now(),
                    x: Math.random() * 80 + 10,
                    y: 100,
                    size: Math.random() * 30 + 20,
                    speed: Math.random() * 2 + 1,
                };
                setBubbles(prev => [...prev, newBubble]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setBubbles(prev =>
                    prev.map(bubble => ({ ...bubble, y: bubble.y - bubble.speed }))
                        .filter(bubble => bubble.y > -10)
                );
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const popBubble = (id: number) => {
        if (breathPhase === 'exhale') {
            setScore(score + 10);
            setBubbles(bubbles.filter(b => b.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="ml-2 font-bold text-foreground">{score}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="ml-2 font-bold text-foreground">{timeLeft}s</span>
                    </div>
                </div>
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Start'}
                </Button>
            </div>

            <div className="bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-xl p-4 relative h-96 overflow-hidden">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-lg font-bold text-foreground capitalize">{breathPhase}</p>
                    <p className="text-sm text-muted-foreground">
                        {breathPhase === 'exhale' ? 'Pop bubbles!' : 'Wait...'}
                    </p>
                </div>

                {bubbles.map(bubble => (
                    <motion.button
                        key={bubble.id}
                        onClick={() => popBubble(bubble.id)}
                        className="absolute rounded-full bg-blue-400/30 border-2 border-blue-400 backdrop-blur-sm"
                        style={{
                            left: `${bubble.x}%`,
                            bottom: `${bubble.y}%`,
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Instructions:</strong> Pop bubbles only during the EXHALE phase to score points!
                </p>
            </div>
        </div>
    );
}

// ============================================
// AFFIRMATION BUILDER GAME
// ============================================
const affirmationWords = {
    start: ['I am', 'I have', 'I will', 'I can', 'I deserve'],
    middle: ['strong', 'capable', 'worthy', 'confident', 'resilient', 'peaceful', 'grateful', 'powerful'],
    end: ['today', 'always', 'in every way', 'and growing', 'every day', 'right now'],
};

export function AffirmationBuilderGame({ onComplete, onClose }: GameProps) {
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [savedAffirmations, setSavedAffirmations] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());

    const selectWord = (word: string) => {
        setSelectedWords([...selectedWords, word]);
    };

    const clearSelection = () => {
        setSelectedWords([]);
    };

    const saveAffirmation = () => {
        if (selectedWords.length >= 2) {
            const affirmation = selectedWords.join(' ');
            setSavedAffirmations([...savedAffirmations, affirmation]);
            setScore(score + selectedWords.length * 10);
            setSelectedWords([]);
        }
    };

    const finishGame = () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        onComplete(score, duration);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-sm">
                    <span className="text-muted-foreground">Affirmations Created:</span>
                    <span className="ml-2 font-bold text-foreground">{savedAffirmations.length}</span>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="ml-2 font-bold text-foreground">{score}</span>
                </div>
            </div>

            <div className="bg-purple/10 border border-purple/20 rounded-xl p-4 min-h-20 flex items-center justify-center">
                <p className="text-lg font-medium text-foreground text-center">
                    {selectedWords.length > 0 ? selectedWords.join(' ') : 'Build your affirmation...'}
                </p>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Start with:</p>
                    <div className="flex flex-wrap gap-2">
                        {affirmationWords.start.map(word => (
                            <Button
                                key={word}
                                variant="outline"
                                size="sm"
                                onClick={() => selectWord(word)}
                                className="hover:bg-purple/10"
                            >
                                {word}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Add qualities:</p>
                    <div className="flex flex-wrap gap-2">
                        {affirmationWords.middle.map(word => (
                            <Button
                                key={word}
                                variant="outline"
                                size="sm"
                                onClick={() => selectWord(word)}
                                className="hover:bg-purple/10"
                            >
                                {word}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">End with:</p>
                    <div className="flex flex-wrap gap-2">
                        {affirmationWords.end.map(word => (
                            <Button
                                key={word}
                                variant="outline"
                                size="sm"
                                onClick={() => selectWord(word)}
                                className="hover:bg-purple/10"
                            >
                                {word}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button onClick={clearSelection} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                <Button onClick={saveAffirmation} disabled={selectedWords.length < 2} className="flex-1 gradient-mental text-primary-foreground">
                    <Check className="w-4 h-4 mr-2" />
                    Save Affirmation
                </Button>
            </div>

            {savedAffirmations.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Your Affirmations:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {savedAffirmations.map((affirmation, index) => (
                            <div key={index} className="bg-muted rounded-lg p-3 text-sm text-foreground italic">
                                "{affirmation}"
                            </div>
                        ))}
                    </div>
                    <Button onClick={finishGame} className="w-full gradient-primary text-primary-foreground">
                        <Trophy className="w-4 h-4 mr-2" />
                        Finish & Save
                    </Button>
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN GAMES COMPONENT
// ============================================
export type GameType = 'memory' | 'breathing' | 'affirmation';

interface MentalHealthGamesProps {
    gameType: GameType;
    userId?: string;
    onGameComplete?: () => void;
}

export function MentalHealthGames({ gameType, userId, onGameComplete }: MentalHealthGamesProps) {
    const { toast } = useToast();

    const handleComplete = async (score: number, duration: number) => {
        if (userId) {
            try {
                await saveGameRecord(userId, gameType, score, duration);
                toast({
                    title: "Game Complete!",
                    description: `You scored ${score} points in ${duration} seconds!`,
                });
            } catch (error) {
                console.error('Error saving game record:', error);
            }
        }

        onGameComplete?.();
    };

    const handleClose = () => {
        onGameComplete?.();
    };

    return (
        <div className="space-y-4">
            {gameType === 'memory' && <MemoryMatchGame onComplete={handleComplete} onClose={handleClose} />}
            {gameType === 'breathing' && <BreathingBubbleGame onComplete={handleComplete} onClose={handleClose} />}
            {gameType === 'affirmation' && <AffirmationBuilderGame onComplete={handleComplete} onClose={handleClose} />}
        </div>
    );
}
