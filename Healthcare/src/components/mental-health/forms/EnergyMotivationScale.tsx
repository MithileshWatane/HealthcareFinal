import { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveEnergyMotivation } from '@/services/dailyCheckInService';

const ENERGY_LEVELS = [
    { value: 1, label: 'Exhausted', icon: '🔴', color: 'bg-destructive/20 border-destructive' },
    { value: 2, label: 'Tired', icon: '🟠', color: 'bg-coral/20 border-coral' },
    { value: 3, label: 'Okay', icon: '🟡', color: 'bg-warning/20 border-warning' },
    { value: 4, label: 'Energized', icon: '🟢', color: 'bg-primary/20 border-primary' },
    { value: 5, label: 'Fully Charged', icon: '⚡', color: 'bg-success/20 border-success' },
];

const MOTIVATION_LEVELS = [
    { value: 1, label: 'None', color: 'bg-destructive/20 border-destructive' },
    { value: 2, label: 'Low', color: 'bg-coral/20 border-coral' },
    { value: 3, label: 'Moderate', color: 'bg-warning/20 border-warning' },
    { value: 4, label: 'High', color: 'bg-primary/20 border-primary' },
    { value: 5, label: 'Very High', color: 'bg-success/20 border-success' },
];

interface EnergyMotivationScaleProps {
    userId?: string;
    onComplete?: () => void;
}

export function EnergyMotivationScale({ userId, onComplete }: EnergyMotivationScaleProps) {
    const [energyLevel, setEnergyLevel] = useState<number | null>(null);
    const [motivationLevel, setMotivationLevel] = useState<number | null>(null);
    const [feelingDrained, setFeelingDrained] = useState<boolean | null>(null);
    const [feltMotivated, setFeltMotivated] = useState<boolean | null>(null);
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

        if (energyLevel === null || motivationLevel === null || feelingDrained === null || feltMotivated === null) {
            toast({
                title: "Incomplete",
                description: "Please answer all questions before saving",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveEnergyMotivation({
                user_id: userId,
                energy_level: energyLevel,
                motivation_level: motivationLevel,
                feeling_drained: feelingDrained,
                felt_motivated_today: feltMotivated,
                notes: notes || undefined
            });

            toast({
                title: "Check-in Saved!",
                description: "Your energy and motivation levels have been recorded"
            });

            onComplete?.();
        } catch (error) {
            console.error('Error saving energy/motivation:', error);
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
                <h3 className="font-display font-semibold text-xl text-foreground">
                    Energy & Motivation Check
                </h3>
                <p className="text-sm text-muted-foreground">
                    How are your energy and motivation levels today?
                </p>
            </div>

            {/* Energy Level */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-primary" />
                    <label className="font-medium text-foreground">Energy Level</label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {ENERGY_LEVELS.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => setEnergyLevel(level.value)}
                            className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                energyLevel === level.value
                                    ? level.color
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="text-2xl mb-1">{level.icon}</div>
                            <div className="text-xs text-foreground">{level.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Motivation Level */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <label className="font-medium text-foreground">Motivation Level</label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {MOTIVATION_LEVELS.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => setMotivationLevel(level.value)}
                            className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                motivationLevel === level.value
                                    ? level.color
                                    : "border-border hover:border-warning/50"
                            )}
                        >
                            <div className="text-xl font-bold mb-1 text-foreground">{level.value}</div>
                            <div className="text-xs text-foreground">{level.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Questions */}
            <div className="space-y-3">
                <div className="bg-muted rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Do you feel drained today?</span>
                        <div className="flex gap-2">
                            <Button
                                variant={feelingDrained === true ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFeelingDrained(true)}
                            >
                                Yes
                            </Button>
                            <Button
                                variant={feelingDrained === false ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFeelingDrained(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Did you feel motivated today?</span>
                        <div className="flex gap-2">
                            <Button
                                variant={feltMotivated === true ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFeltMotivated(true)}
                            >
                                Yes
                            </Button>
                            <Button
                                variant={feltMotivated === false ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFeltMotivated(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Additional Notes (Optional)
                </label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything affecting your energy or motivation today?"
                    className="min-h-20 resize-none"
                />
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isSaving || energyLevel === null || motivationLevel === null || feelingDrained === null || feltMotivated === null}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Check-in'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why track energy & motivation?</strong> Helps detect burnout patterns and energy management needs.
                </p>
            </div>
        </motion.div>
    );
}
