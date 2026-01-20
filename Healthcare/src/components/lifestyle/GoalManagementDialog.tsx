import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { LifestyleGoal, createGoal, updateGoal, deleteGoal, getActiveGoals } from "@/services/lifestyleService";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GoalManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    onSuccess?: () => void;
}

export function GoalManagementDialog({ open, onOpenChange, userId, onSuccess }: GoalManagementDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState<LifestyleGoal[]>([]);
    const [showNewGoalForm, setShowNewGoalForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

    // New goal form state
    const [category, setCategory] = useState<"sleep" | "exercise" | "hydration" | "nutrition">("sleep");
    const [title, setTitle] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [unit, setUnit] = useState("");
    const [deadline, setDeadline] = useState("");

    useEffect(() => {
        if (open) {
            loadGoals();
        }
    }, [open, userId]);

    const loadGoals = async () => {
        setLoading(true);
        try {
            const { data, error } = await getActiveGoals(userId);
            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error("Error loading goals:", error);
            toast({
                title: "Error",
                description: "Failed to load goals.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!title || !targetValue) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const newGoal: LifestyleGoal = {
                user_id: userId,
                category,
                title,
                target_value: parseFloat(targetValue),
                current_value: 0,
                unit: unit || getDefaultUnit(category),
                deadline: deadline || undefined,
                is_active: true,
            };

            const { error } = await createGoal(newGoal);
            if (error) throw error;

            toast({
                title: "Success!",
                description: "Goal created successfully.",
            });

            // Reset form
            setTitle("");
            setTargetValue("");
            setUnit("");
            setDeadline("");
            setShowNewGoalForm(false);

            // Reload goals
            await loadGoals();
            onSuccess?.();
        } catch (error) {
            console.error("Error creating goal:", error);
            toast({
                title: "Error",
                description: "Failed to create goal.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        setLoading(true);
        try {
            const { error } = await deleteGoal(goalId);
            if (error) throw error;

            toast({
                title: "Success!",
                description: "Goal deleted successfully.",
            });

            await loadGoals();
            onSuccess?.();
        } catch (error) {
            console.error("Error deleting goal:", error);
            toast({
                title: "Error",
                description: "Failed to delete goal.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setGoalToDelete(null);
        }
    };

    const handleToggleGoal = async (goal: LifestyleGoal) => {
        if (!goal.id) return;

        setLoading(true);
        try {
            const { error } = await updateGoal(goal.id, {
                is_active: !goal.is_active,
            });

            if (error) throw error;

            toast({
                title: "Success!",
                description: `Goal ${goal.is_active ? "deactivated" : "activated"} successfully.`,
            });

            await loadGoals();
            onSuccess?.();
        } catch (error) {
            console.error("Error toggling goal:", error);
            toast({
                title: "Error",
                description: "Failed to update goal.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getDefaultUnit = (category: string) => {
        switch (category) {
            case "sleep":
                return "hours";
            case "exercise":
                return "minutes";
            case "hydration":
                return "cups";
            case "nutrition":
                return "calories";
            default:
                return "";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "sleep":
                return "text-purple-500";
            case "exercise":
                return "text-primary";
            case "hydration":
                return "text-secondary";
            case "nutrition":
                return "text-coral";
            default:
                return "text-foreground";
        }
    };

    const getCategoryBg = (category: string) => {
        switch (category) {
            case "sleep":
                return "bg-purple-500/10";
            case "exercise":
                return "bg-primary/10";
            case "hydration":
                return "bg-secondary/10";
            case "nutrition":
                return "bg-coral/10";
            default:
                return "bg-muted";
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display">Manage Goals</DialogTitle>
                        <DialogDescription>
                            Create and manage your lifestyle goals to stay motivated and track your progress.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Existing Goals */}
                        {loading && goals.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : goals.length === 0 && !showNewGoalForm ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No goals yet. Create your first goal!</p>
                                <Button onClick={() => setShowNewGoalForm(true)} className="gradient-primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Goal
                                </Button>
                            </div>
                        ) : (
                            <>
                                {goals.map((goal) => (
                                    <div
                                        key={goal.id}
                                        className={`border border-border rounded-lg p-4 ${getCategoryBg(goal.category)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryBg(
                                                            goal.category
                                                        )} ${getCategoryColor(goal.category)}`}
                                                    >
                                                        {goal.category}
                                                    </span>
                                                    {!goal.is_active && (
                                                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-foreground mb-1">{goal.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Target: {goal.target_value} {goal.unit}
                                                    {goal.deadline && (
                                                        <> • Deadline: {new Date(goal.deadline).toLocaleDateString()}</>
                                                    )}
                                                </p>
                                                {goal.current_value !== undefined && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">Progress</span>
                                                            <span className="font-medium">
                                                                {Math.round((goal.current_value / goal.target_value) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        (goal.current_value / goal.target_value) * 100
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleGoal(goal)}
                                                    disabled={loading}
                                                >
                                                    {goal.is_active ? "Pause" : "Resume"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setGoalToDelete(goal.id!);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={loading}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {!showNewGoalForm && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewGoalForm(true)}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Goal
                                    </Button>
                                )}
                            </>
                        )}

                        {/* New Goal Form */}
                        {showNewGoalForm && (
                            <div className="border border-border rounded-lg p-4 bg-muted/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">New Goal</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowNewGoalForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sleep">Sleep</SelectItem>
                                                <SelectItem value="exercise">Exercise</SelectItem>
                                                <SelectItem value="hydration">Hydration</SelectItem>
                                                <SelectItem value="nutrition">Nutrition</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Goal Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Sleep 8 hours daily"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="targetValue">Target Value *</Label>
                                            <Input
                                                id="targetValue"
                                                type="number"
                                                step="0.1"
                                                placeholder="8"
                                                value={targetValue}
                                                onChange={(e) => setTargetValue(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unit</Label>
                                            <Input
                                                id="unit"
                                                placeholder={getDefaultUnit(category)}
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleCreateGoal}
                                        disabled={loading}
                                        className="w-full gradient-primary"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Goal"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this goal. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => goalToDelete && handleDeleteGoal(goalToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
