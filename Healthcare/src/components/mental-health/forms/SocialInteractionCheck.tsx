import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Save, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveSocialInteraction } from '@/services/dailyCheckInService';

const CONNECTION_QUALITY = [
    { value: 1, label: 'Very Poor', color: 'bg-destructive/20 border-destructive' },
    { value: 2, label: 'Poor', color: 'bg-coral/20 border-coral' },
    { value: 3, label: 'Okay', color: 'bg-warning/20 border-warning' },
    { value: 4, label: 'Good', color: 'bg-primary/20 border-primary' },
    { value: 5, label: 'Excellent', color: 'bg-success/20 border-success' },
];

const SOCIAL_ENERGY = [
    { value: 'drained', label: 'Drained', icon: '😓', color: 'bg-destructive/20 border-destructive' },
    { value: 'neutral', label: 'Neutral', icon: '😐', color: 'bg-warning/20 border-warning' },
    { value: 'energized', label: 'Energized', icon: '⚡', color: 'bg-success/20 border-success' },
];

interface SocialInteractionCheckProps {
    userId?: string;
    onComplete?: () => void;
}

export function SocialInteractionCheck({ userId, onComplete }: SocialInteractionCheckProps) {
    const [talkedToSomeone, setTalkedToSomeone] = useState<boolean | null>(null);
    const [feltConnected, setFeltConnected] = useState<boolean | null>(null);
    const [connectionQuality, setConnectionQuality] = useState<number | null>(null);
    const [socialEnergy, setSocialEnergy] = useState<'energized' | 'neutral' | 'drained' | null>(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!userId) {
            toast({
                title: "Please sign in",
                description: "You need to be signed in to save your check-in",
                variant: "destructive"
            });
            return;
        }

        if (talkedToSomeone === null || feltConnected === null) {
            toast({
                title: "Incomplete",
                description: "Please answer the required questions before saving",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveSocialInteraction({
                user_id: userId,
                talked_to_someone: talkedToSomeone,
                felt_connected: feltConnected,
                connection_quality: connectionQuality || undefined,
                social_energy: socialEnergy || undefined,
                notes: notes || undefined
            });

            toast({
                title: "Check-in Saved!",
                description: "Your social interaction has been recorded"
            });

            onComplete?.();
        } catch (error) {
            console.error('Error saving social interaction:', error);
            toast({
                title: "Error",
                description: "Failed to save your check-in. Please try again.",
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
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground">
                    Social Connection Check
                </h3>
                <p className="text-sm text-muted-foreground">
                    How were your social interactions today?
                </p>
            </div>

            {/* Main Questions */}
            <div className="space-y-4">
                <div className="bg-muted rounded-xl p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Did you talk to someone today?
                        </label>
                        <div className="flex gap-2">
                            <Button
                                variant={talkedToSomeone === true ? "default" : "outline"}
                                size="lg"
                                onClick={() => setTalkedToSomeone(true)}
                                className="flex-1"
                            >
                                Yes
                            </Button>
                            <Button
                                variant={talkedToSomeone === false ? "default" : "outline"}
                                size="lg"
                                onClick={() => setTalkedToSomeone(false)}
                                className="flex-1"
                            >
                                No
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Did you feel connected to others?
                        </label>
                        <div className="flex gap-2">
                            <Button
                                variant={feltConnected === true ? "default" : "outline"}
                                size="lg"
                                onClick={() => setFeltConnected(true)}
                                className="flex-1"
                            >
                                <Heart className="w-4 h-4 mr-2" />
                                Yes
                            </Button>
                            <Button
                                variant={feltConnected === false ? "default" : "outline"}
                                size="lg"
                                onClick={() => setFeltConnected(false)}
                                className="flex-1"
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Connection Quality (Optional) */}
                {talkedToSomeone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                    >
                        <label className="text-sm font-medium text-foreground">
                            Connection Quality (Optional)
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {CONNECTION_QUALITY.map((quality) => (
                                <button
                                    key={quality.value}
                                    onClick={() => setConnectionQuality(quality.value)}
                                    className={cn(
                                        "p-3 rounded-xl border-2 transition-all text-center",
                                        connectionQuality === quality.value
                                            ? quality.color
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="text-lg font-bold mb-1 text-foreground">{quality.value}</div>
                                    <div className="text-xs text-foreground">{quality.label}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Social Energy (Optional) */}
                {talkedToSomeone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                    >
                        <label className="text-sm font-medium text-foreground">
                            How did social interaction make you feel? (Optional)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {SOCIAL_ENERGY.map((energy) => (
                                <button
                                    key={energy.value}
                                    onClick={() => setSocialEnergy(energy.value as any)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all text-center",
                                        socialEnergy === energy.value
                                            ? energy.color
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="text-3xl mb-2">{energy.icon}</div>
                                    <div className="text-sm font-medium text-foreground">{energy.label}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Optional Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Additional Notes (Optional)
                    </label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any thoughts about your social interactions today?"
                        className="min-h-20 resize-none"
                    />
                </div>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isSaving || talkedToSomeone === null || feltConnected === null}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Check-in'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why track social connection?</strong> Social isolation is a key indicator of mental health concerns.
                </p>
            </div>
        </motion.div>
    );
}
