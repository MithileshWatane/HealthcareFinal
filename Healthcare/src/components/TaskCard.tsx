import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Edit, Pill, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onStatusChange: (taskId: string, status: Task["status"]) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
    const isCompleted = task.status === "completed";
    const isInProgress = task.status === "in_progress";

    const renderTime = () => {
        if (!task.time) return null;
        return `${task.time} ${task.time_period || ''}`;
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-full", isCompleted ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary")}>
                            <Pill className="h-4 w-4" />
                        </div>
                        <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    </div>
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {task.description && <div className="text-sm text-muted-foreground mb-1">{task.description}</div>}
                <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {renderTime()}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
                {!isCompleted && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => onStatusChange(task.id, "completed")}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Mark Complete
                    </Button>
                )}
                {task.status === "to_complete" && (
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => onStatusChange(task.id, "in_progress")}
                    >
                        In Progress
                    </Button>
                )}
                {isInProgress && (
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => onStatusChange(task.id, "to_complete")}
                    >
                        Move to Todo
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
