import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { saveSleepReflection } from '@/services/guidedActivityService';

const SLEEP_QUALITY = [
    { value: 1, label: 'Very Poor', color: 'bg-destructive/20 border-destructive' },
    { value: 2, label: 'Poor', color: 'bg-coral/20 border-coral' },
    { value: 3, label: 'Fair', color: 'bg-warning/20 border-warning' },
    { value: 4, label: 'Good', color: 'bg-primary/20 border-primary' },
    { value: 5, label: 'Excellent', color: 'bg-success/20 border-success' },
];

const SLEEP_ISSUES = [
    'Insomnia',
    'Nightmares',
    'Restless sleep',
    'Woke up frequently',
    'Difficulty falling asleep',
    'Woke up too early',
];

interface SleepReflectionProps {
    userId?: string;
    onComplete?: () => void;
}

export function SleepReflection({ userId, onComplete }: SleepReflectionProps) {
    const [sleepQuality, setSleepQuality] = useState<number | null>(null);
    const [hoursSlept, setHoursSlept] = useState([7]);
    const [wakeUpCount, setWakeUpCount] = useState([0]);
    const [hadDreams, setHadDreams] = useState<boolean | null>(null);
    const [dreamDescription, setDreamDescription] = useState('');
    const [sleepIssues, setSleepIssues] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const toggleSleepIssue = (issue: string) => {
        setSleepIssues(prev =>
            prev.includes(issue)
                ? prev.filter(i => i !== issue)
                : [...prev, issue]
        );
    };

    const handleSave = async () => {
        if (!userId) {
            toast({
                title: "Please sign in",
                description: "You need to be signed in to save your reflection",
                variant: "destructive"
            });
            return;
        }

        if (sleepQuality === null || hadDreams === null) {
            toast({
                title: "Incomplete",
                description: "Please answer all required questions",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);

        try {
            await saveSleepReflection({
                user_id: userId,
                sleep_quality: sleepQuality,
                hours_slept: hoursSlept[0],
                wake_up_count: wakeUpCount[0],
                had_dreams: hadDreams,
                dream_description: dreamDescription || undefined,
                sleep_issues: sleepIssues.length > 0 ? sleepIssues : undefined
            });

            toast({
                title: "Reflection Saved!",
                description: "Your sleep data has been recorded"
            });

            onComplete?.();
        } catch (error) {
            console.error('Error saving sleep reflection:', error);
            toast({
                title: "Error",
                description: "Failed to save your reflection. Please try again.",
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
                    <Moon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground">
                    Sleep Reflection
                </h3>
                <p className="text-sm text-muted-foreground">
                    How was your sleep last night?
                </p>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Sleep Quality</label>
                <div className="grid grid-cols-5 gap-2">
                    {SLEEP_QUALITY.map((quality) => (
                        <button
                            key={quality.value}
                            onClick={() => setSleepQuality(quality.value)}
                            className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                sleepQuality === quality.value
                                    ? quality.color
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="text-lg font-bold mb-1 text-foreground">{quality.value}</div>
                            <div className="text-xs text-foreground">{quality.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hours Slept */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Hours Slept</label>
                <div className="text-center">
                    <p className="text-3xl font-bold text-foreground mb-2">{hoursSlept[0]} hours</p>
                </div>
                <Slider
                    value={hoursSlept}
                    onValueChange={setHoursSlept}
                    min={0}
                    max={12}
                    step={0.5}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                </div>
            </div>

            {/* Wake Up Count */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Times Woke Up</label>
                <div className="text-center">
                    <p className="text-3xl font-bold text-foreground mb-2">{wakeUpCount[0]} times</p>
                </div>
                <Slider
                    value={wakeUpCount}
                    onValueChange={setWakeUpCount}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Dreams */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Did you have dreams?</label>
                <div className="flex gap-2">
                    <Button
                        variant={hadDreams === true ? "default" : "outline"}
                        onClick={() => setHadDreams(true)}
                        className="flex-1"
                    >
                        Yes
                    </Button>
                    <Button
                        variant={hadDreams === false ? "default" : "outline"}
                        onClick={() => setHadDreams(false)}
                        className="flex-1"
                    >
                        No
                    </Button>
                </div>
            </div>

            {hadDreams && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-foreground">Describe your dreams (Optional)</label>
                    <Textarea
                        value={dreamDescription}
                        onChange={(e) => setDreamDescription(e.target.value)}
                        placeholder="What did you dream about?"
                        className="min-h-24 resize-none"
                    />
                </motion.div>
            )}

            {/* Sleep Issues */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Sleep Issues (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                    {SLEEP_ISSUES.map((issue) => (
                        <div
                            key={issue}
                            className="flex items-center space-x-2 bg-muted rounded-lg p-3"
                        >
                            <Checkbox
                                id={issue}
                                checked={sleepIssues.includes(issue)}
                                onCheckedChange={() => toggleSleepIssue(issue)}
                            />
                            <label
                                htmlFor={issue}
                                className="text-sm text-foreground cursor-pointer flex-1"
                            >
                                {issue}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving || sleepQuality === null || hadDreams === null}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Reflection'}
            </Button>

            <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Why track sleep?</strong> Sleep quality is strongly linked to mental health and can indicate depression, anxiety, or PTSD.
                </p>
            </div>
        </motion.div>
    );
}
