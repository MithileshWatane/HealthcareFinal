import { useEffect, useState } from "react";
import { Bell, Settings, Plus, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskModal } from "@/components/TaskModal";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Alerts() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values: any) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...values, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTasks([data, ...tasks]);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (values: any) => {
    if (!currentTask) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(values)
        .eq("id", currentTask.id)
        .select()
        .single();

      if (error) throw error;
      setTasks(tasks.map((t) => (t.id === currentTask.id ? data : t)));
      toast.success("Task updated successfully");
      setCurrentTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      toast.success(`Task marked as ${status.replace("_", " ")}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const openCreateModal = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = (status: Task["status"]) => tasks.filter((t) => t.status === status);

  return (
    <Layout>
      <PageHeader
        icon={Bell}
        title="Health To-Do List & Alerts"
        description="Manage your medications, appointments, and daily health tasks."
        gradient="gradient-alert"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Todo List Area */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-card border border-border p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-foreground">My Tasks</h3>
              <Button onClick={openCreateModal} className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="to_complete" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="to_complete">To Complete ({filteredTasks("to_complete").length})</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress ({filteredTasks("in_progress").length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({filteredTasks("completed").length})</TabsTrigger>
                </TabsList>

                {["to_complete", "in_progress", "completed"].map((status) => (
                  <TabsContent key={status} value={status} className="space-y-4">
                    {filteredTasks(status as Task["status"]).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        <p>No tasks in this category.</p>
                      </div>
                    ) : (
                      filteredTasks(status as Task["status"]).map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <TaskCard
                            task={task}
                            onEdit={openEditModal}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleStatusChange}
                          />
                        </motion.div>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>

        {/* Settings & Static Info */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: "Push Notifications", enabled: true },
                { label: "WhatsApp Reminders", enabled: true },
                { label: "Email Alerts", enabled: false },
                { label: "Emergency Alerts", enabled: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{setting.label}</span>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-coral/10 to-warning/10 rounded-2xl p-5 border border-coral/20">
            <h4 className="font-semibold text-foreground mb-2">Did you know?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Tracking your medication adherence can improve your health outcomes by up to 30%.
            </p>
          </div>
        </div>
      </div>

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={currentTask ? handleUpdateTask : handleCreateTask}
        task={currentTask}
      />
    </Layout>
  );
}
