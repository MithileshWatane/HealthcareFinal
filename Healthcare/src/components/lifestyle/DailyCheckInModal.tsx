import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Footprints, Droplets, Utensils, Loader2 } from "lucide-react";
import { DailyCheckIn, saveDailyCheckIn } from "@/services/lifestyleService";
import { useToast } from "@/hooks/use-toast";

interface DailyCheckInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    onSuccess?: () => void;
}

export function DailyCheckInModal({ open, onOpenChange, userId, onSuccess }: DailyCheckInModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("sleep");

    // Sleep state
    const [sleepHours, setSleepHours] = useState("");
    const [sleepQuality, setSleepQuality] = useState("");
    const [bedtime, setBedtime] = useState("");
    const [wakeTime, setWakeTime] = useState("");
    const [sleepNotes, setSleepNotes] = useState("");

    // Activity state
    const [steps, setSteps] = useState("");
    const [exerciseDuration, setExerciseDuration] = useState("");
    const [activityType, setActivityType] = useState("");
    const [caloriesBurned, setCaloriesBurned] = useState("");
    const [activityNotes, setActivityNotes] = useState("");

    // Hydration state
    const [cupsConsumed, setCupsConsumed] = useState("");
    const [targetCups, setTargetCups] = useState("10");

    // Nutrition state
    const [meals, setMeals] = useState<Array<{ type: string; calories: string; description: string }>>([
        { type: "breakfast", calories: "", description: "" }
    ]);

    const addMeal = () => {
        setMeals([...meals, { type: "lunch", calories: "", description: "" }]);
    };

    const updateMeal = (index: number, field: string, value: string) => {
        const updated = [...meals];
        updated[index] = { ...updated[index], [field]: value };
        setMeals(updated);
    };

    const removeMeal = (index: number) => {
        setMeals(meals.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const checkInData: DailyCheckIn = {};

            // Add sleep data if provided
            if (sleepHours) {
                checkInData.sleep = {
                    duration_hours: parseFloat(sleepHours),
                    quality_score: sleepQuality ? parseInt(sleepQuality) : undefined,
                    bedtime: bedtime || undefined,
                    wake_time: wakeTime || undefined,
                    notes: sleepNotes || undefined,
                };
            }

            // Add activity data if provided
            if (steps || exerciseDuration) {
                checkInData.activity = {
                    steps: steps ? parseInt(steps) : undefined,
                    exercise_duration_minutes: exerciseDuration ? parseInt(exerciseDuration) : undefined,
                    activity_type: activityType || undefined,
                    calories_burned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
                    notes: activityNotes || undefined,
                };
            }

            // Add hydration data if provided
            if (cupsConsumed) {
                checkInData.hydration = {
                    cups_consumed: parseInt(cupsConsumed),
                    target_cups: parseInt(targetCups),
                };
            }

            // Add nutrition data if provided
            const validMeals = meals.filter(m => m.calories && parseInt(m.calories) > 0);
            if (validMeals.length > 0) {
                checkInData.nutrition = validMeals.map(m => ({
                    meal_type: m.type as any,
                    calories: parseInt(m.calories),
                    description: m.description || undefined,
                }));
            }

            const { error } = await saveDailyCheckIn(userId, checkInData);

            if (error) {
                throw error;
            }

            toast({
                title: "Success!",
                description: "Your daily check-in has been saved.",
            });

            // Reset form
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error saving check-in:", error);
            toast({
                title: "Error",
                description: "Failed to save your check-in. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSleepHours("");
        setSleepQuality("");
        setBedtime("");
        setWakeTime("");
        setSleepNotes("");
        setSteps("");
        setExerciseDuration("");
        setActivityType("");
        setCaloriesBurned("");
        setActivityNotes("");
        setCupsConsumed("");
        setTargetCups("10");
        setMeals([{ type: "breakfast", calories: "", description: "" }]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display">Daily Check-In</DialogTitle>
                    <DialogDescription>
                        Log your daily activities to track your lifestyle and get personalized insights.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="sleep" className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Sleep
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="flex items-center gap-2">
                            <Footprints className="w-4 h-4" />
                            Activity
                        </TabsTrigger>
                        <TabsTrigger value="hydration" className="flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Hydration
                        </TabsTrigger>
                        <TabsTrigger value="nutrition" className="flex items-center gap-2">
                            <Utensils className="w-4 h-4" />
                            Nutrition
                        </TabsTrigger>
                    </TabsList>

                    {/* Sleep Tab */}
                    <TabsContent value="sleep" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sleepHours">Hours of Sleep *</Label>
                                <Input
                                    id="sleepHours"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    placeholder="7.5"
                                    value={sleepHours}
                                    onChange={(e) => setSleepHours(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sleepQuality">Sleep Quality (1-5)</Label>
                                <Select value={sleepQuality} onValueChange={setSleepQuality}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="3">3 - Good</SelectItem>
                                        <SelectItem value="4">4 - Very Good</SelectItem>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bedtime">Bedtime</Label>
                                <Input
                                    id="bedtime"
                                    type="time"
                                    value={bedtime}
                                    onChange={(e) => setBedtime(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wakeTime">Wake Time</Label>
                                <Input
                                    id="wakeTime"
                                    type="time"
                                    value={wakeTime}
                                    onChange={(e) => setWakeTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sleepNotes">Notes</Label>
                            <Textarea
                                id="sleepNotes"
                                placeholder="How did you sleep? Any dreams or disturbances?"
                                value={sleepNotes}
                                onChange={(e) => setSleepNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="steps">Steps</Label>
                                <Input
                                    id="steps"
                                    type="number"
                                    min="0"
                                    placeholder="10000"
                                    value={steps}
                                    onChange={(e) => setSteps(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exerciseDuration">Exercise Duration (min)</Label>
                                <Input
                                    id="exerciseDuration"
                                    type="number"
                                    min="0"
                                    placeholder="30"
                                    value={exerciseDuration}
                                    onChange={(e) => setExerciseDuration(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="activityType">Activity Type</Label>
                                <Select value={activityType} onValueChange={setActivityType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select activity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="walking">Walking</SelectItem>
                                        <SelectItem value="running">Running</SelectItem>
                                        <SelectItem value="cycling">Cycling</SelectItem>
                                        <SelectItem value="swimming">Swimming</SelectItem>
                                        <SelectItem value="gym">Gym Workout</SelectItem>
                                        <SelectItem value="yoga">Yoga</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caloriesBurned">Calories Burned</Label>
                                <Input
                                    id="caloriesBurned"
                                    type="number"
                                    min="0"
                                    placeholder="250"
                                    value={caloriesBurned}
                                    onChange={(e) => setCaloriesBurned(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="activityNotes">Notes</Label>
                            <Textarea
                                id="activityNotes"
                                placeholder="How did you feel during your activities?"
                                value={activityNotes}
                                onChange={(e) => setActivityNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </TabsContent>

                    {/* Hydration Tab */}
                    <TabsContent value="hydration" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cupsConsumed">Cups Consumed *</Label>
                                <Input
                                    id="cupsConsumed"
                                    type="number"
                                    min="0"
                                    placeholder="8"
                                    value={cupsConsumed}
                                    onChange={(e) => setCupsConsumed(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="targetCups">Daily Target</Label>
                                <Input
                                    id="targetCups"
                                    type="number"
                                    min="0"
                                    placeholder="10"
                                    value={targetCups}
                                    onChange={(e) => setTargetCups(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">
                                💡 Tip: One cup is approximately 8 oz (240ml). Aim for 8-10 cups per day for optimal hydration.
                            </p>
                        </div>
                    </TabsContent>

                    {/* Nutrition Tab */}
                    <TabsContent value="nutrition" className="space-y-4 mt-4">
                        {meals.map((meal, index) => (
                            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Meal {index + 1}</Label>
                                    {meals.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMeal(index)}
                                            className="text-destructive"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Meal Type</Label>
                                        <Select
                                            value={meal.type}
                                            onValueChange={(value) => updateMeal(index, "type", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="breakfast">Breakfast</SelectItem>
                                                <SelectItem value="lunch">Lunch</SelectItem>
                                                <SelectItem value="dinner">Dinner</SelectItem>
                                                <SelectItem value="snack">Snack</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Calories</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="500"
                                            value={meal.calories}
                                            onChange={(e) => updateMeal(index, "calories", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="What did you eat?"
                                        value={meal.description}
                                        onChange={(e) => updateMeal(index, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addMeal} className="w-full">
                            + Add Another Meal
                        </Button>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="gradient-primary">
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Check-In"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
