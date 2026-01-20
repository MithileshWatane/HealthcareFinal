import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Moon, Cloud, Sun, MessageCircle, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type WellnessActivityType = "meditation" | "breathing" | "gratitude" | "counselor";

interface WellnessModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityType: WellnessActivityType | null;
    onComplete?: (activityType: string, duration: number) => void;
}

export function WellnessModal({ isOpen, onClose, activityType, onComplete }: WellnessModalProps) {
    const [gratitudeEntry, setGratitudeEntry] = useState("");
    const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [breathingTimer, setBreathingTimer] = useState(0);
    const [breathingActive, setBreathingActive] = useState(false);
    const [meditationTimer, setMeditationTimer] = useState(0);
    const [meditationActive, setMeditationActive] = useState(false);

    // Breathing exercise timer
    useEffect(() => {
        if (!breathingActive) return;

        const interval = setInterval(() => {
            setBreathingTimer((prev) => {
                const newTime = prev + 1;

                // Breathing pattern: 4s inhale, 4s hold, 6s exhale
                if (breathingPhase === "inhale" && newTime >= 4) {
                    setBreathingPhase("hold");
                    return 0;
                } else if (breathingPhase === "hold" && newTime >= 4) {
                    setBreathingPhase("exhale");
                    return 0;
                } else if (breathingPhase === "exhale" && newTime >= 6) {
                    setBreathingPhase("inhale");
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [breathingActive, breathingPhase]);

    // Meditation timer
    useEffect(() => {
        if (!meditationActive) return;

        const interval = setInterval(() => {
            setMeditationTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [meditationActive]);

    const handleClose = () => {
        setGratitudeEntry("");
        setBreathingActive(false);
        setBreathingTimer(0);
        setBreathingPhase("inhale");
        setMeditationActive(false);
        setMeditationTimer(0);
        onClose();
    };

    const handleSaveGratitude = () => {
        if (gratitudeEntry.trim()) {
            onComplete?.("gratitude", 5);
            handleClose();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const renderContent = () => {
        switch (activityType) {
            case "meditation":
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="w-32 h-32 mx-auto rounded-full bg-purple/10 flex items-center justify-center">
                                <Moon className="w-16 h-16 text-purple" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-4xl font-bold text-foreground">{formatTime(meditationTimer)}</p>
                                <p className="text-muted-foreground">
                                    {meditationActive ? "Meditating..." : "Ready to begin"}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={() => setMeditationActive(!meditationActive)}
                                    className="gradient-mental text-primary-foreground"
                                >
                                    {meditationActive ? (
                                        <>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMeditationTimer(0);
                                        setMeditationActive(false);
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            </div>

                            {meditationTimer > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onComplete?.("meditation", Math.floor(meditationTimer / 60));
                                        handleClose();
                                    }}
                                >
                                    Complete Session
                                </Button>
                            )}
                        </div>

                        <div className="bg-muted rounded-xl p-4 space-y-2">
                            <h4 className="font-semibold text-foreground">Meditation Guide</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Find a comfortable seated position</li>
                                <li>• Close your eyes and focus on your breath</li>
                                <li>• Let thoughts pass without judgment</li>
                                <li>• Return focus to your breath when distracted</li>
                            </ul>
                        </div>
                    </div>
                );

            case "breathing":
                const getBreathingProgress = () => {
                    if (breathingPhase === "inhale") return (breathingTimer / 4) * 33;
                    if (breathingPhase === "hold") return 33 + (breathingTimer / 4) * 33;
                    return 66 + (breathingTimer / 6) * 34;
                };

                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={breathingPhase}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="relative w-48 h-48 mx-auto"
                                >
                                    <div className={cn(
                                        "absolute inset-0 rounded-full transition-all duration-1000",
                                        breathingPhase === "inhale" && "bg-purple/20 scale-100",
                                        breathingPhase === "hold" && "bg-purple/30 scale-110",
                                        breathingPhase === "exhale" && "bg-purple/10 scale-90"
                                    )}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Cloud className="w-20 h-20 text-purple" />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-foreground capitalize">{breathingPhase}</p>
                                <Progress value={getBreathingProgress()} className="h-2" />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={() => setBreathingActive(!breathingActive)}
                                    className="gradient-mental text-primary-foreground"
                                >
                                    {breathingActive ? (
                                        <>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setBreathingTimer(0);
                                        setBreathingPhase("inhale");
                                        setBreathingActive(false);
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted rounded-xl p-4 space-y-2">
                            <h4 className="font-semibold text-foreground">Breathing Pattern</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Inhale deeply for 4 seconds</li>
                                <li>• Hold your breath for 4 seconds</li>
                                <li>• Exhale slowly for 6 seconds</li>
                                <li>• Repeat for 5 minutes</li>
                            </ul>
                        </div>
                    </div>
                );

            case "gratitude":
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-warning/10 flex items-center justify-center mb-4">
                                <Sun className="w-10 h-10 text-warning" />
                            </div>
                            <p className="text-muted-foreground">
                                Write down three things you're grateful for today
                            </p>
                        </div>

                        <Textarea
                            value={gratitudeEntry}
                            onChange={(e) => setGratitudeEntry(e.target.value)}
                            placeholder="1. I'm grateful for...&#10;2. I appreciate...&#10;3. I'm thankful for..."
                            className="min-h-32 resize-none"
                        />

                        <Button
                            onClick={handleSaveGratitude}
                            disabled={!gratitudeEntry.trim()}
                            className="w-full gradient-mental text-primary-foreground"
                        >
                            Save Gratitude Entry
                        </Button>

                        <div className="bg-muted rounded-xl p-4 space-y-2">
                            <h4 className="font-semibold text-foreground">Benefits of Gratitude</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Improves mental well-being</li>
                                <li>• Reduces stress and anxiety</li>
                                <li>• Enhances sleep quality</li>
                                <li>• Strengthens relationships</li>
                            </ul>
                        </div>
                    </div>
                );

            case "counselor":
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Professional Support Available
                            </h3>
                            <p className="text-muted-foreground">
                                Our licensed counselors are here to help you 24/7
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-muted rounded-xl p-4">
                                <h4 className="font-semibold text-foreground mb-2">Crisis Hotline</h4>
                                <p className="text-2xl font-bold text-primary">1-800-273-8255</p>
                                <p className="text-sm text-muted-foreground mt-1">Available 24/7</p>
                            </div>

                            <div className="bg-muted rounded-xl p-4">
                                <h4 className="font-semibold text-foreground mb-2">Online Chat</h4>
                                <Button className="w-full gradient-primary text-primary-foreground">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Start Chat Session
                                </Button>
                            </div>

                            <div className="bg-muted rounded-xl p-4">
                                <h4 className="font-semibold text-foreground mb-2">Schedule Appointment</h4>
                                <Button variant="outline" className="w-full">
                                    Book a Session
                                </Button>
                            </div>
                        </div>

                        <div className="bg-purple/10 border border-purple/20 rounded-xl p-4">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Remember:</strong> Seeking help is a sign of strength.
                                You don't have to face challenges alone.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (activityType) {
            case "meditation":
                return "Guided Meditation";
            case "breathing":
                return "Breathing Exercise";
            case "gratitude":
                return "Gratitude Journal";
            case "counselor":
                return "Talk to a Counselor";
            default:
                return "";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>
                        Take a moment for your mental well-being
                    </DialogDescription>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
