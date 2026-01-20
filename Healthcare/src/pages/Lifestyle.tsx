import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Utensils, Moon, Footprints, Droplets, TrendingUp, Target, Calendar, Settings, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DailyCheckInModal } from "@/components/lifestyle/DailyCheckInModal";
import { GoalManagementDialog } from "@/components/lifestyle/GoalManagementDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  getWeeklyStats,
  getWeeklyChartData,
  generateRecommendations,
  getActiveGoals,
  WeeklyStats,
  LifestyleGoal,
} from "@/services/lifestyleService";

interface Recommendation {
  title: string;
  description: string;
  priority: string;
  category: string;
}

export default function Lifestyle() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);

  // Data state
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [goals, setGoals] = useState<LifestyleGoal[]>([]);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
  }, [userId]);

  const initializeUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your lifestyle data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting user:", error);
    }
  };

  const loadAllData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [statsRes, chartRes, recsRes, goalsRes] = await Promise.all([
        getWeeklyStats(userId),
        getWeeklyChartData(userId),
        generateRecommendations(userId),
        getActiveGoals(userId),
      ]);

      if (statsRes.data) setWeeklyStats(statsRes.data);
      if (chartRes.data) setChartData(chartRes.data);
      if (recsRes.data) setRecommendations(recsRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
    } catch (error) {
      console.error("Error loading lifestyle data:", error);
      toast({
        title: "Error",
        description: "Failed to load lifestyle data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSuccess = () => {
    loadAllData();
  };

  const handleGoalsSuccess = () => {
    loadAllData();
  };

  const lifestyleMetrics = weeklyStats ? [
    {
      icon: Moon,
      label: "Avg Sleep",
      value: `${weeklyStats.avgSleep}h`,
      target: "8h",
      progress: weeklyStats.sleepProgress,
      color: "text-purple-500",
    },
    {
      icon: Footprints,
      label: "Avg Steps",
      value: weeklyStats.avgSteps.toLocaleString(),
      target: "10k",
      progress: weeklyStats.stepsProgress,
      color: "text-primary",
    },
    {
      icon: Droplets,
      label: "Hydration",
      value: `${weeklyStats.avgHydration} cups`,
      target: "10 cups",
      progress: weeklyStats.hydrationProgress,
      color: "text-secondary",
    },
    {
      icon: Utensils,
      label: "Calories",
      value: weeklyStats.avgCalories.toLocaleString(),
      target: "2,000",
      progress: weeklyStats.caloriesProgress,
      color: "text-coral",
    },
  ] : [];

  if (!userId) {
    return (
      <Layout>
        <PageHeader
          icon={Heart}
          title="Lifestyle Analysis"
          description="Track and analyze your daily habits to build a healthier lifestyle."
          gradient="bg-coral"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view your lifestyle data.</p>
            <Button onClick={() => window.location.href = "/login"}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        icon={Heart}
        title="Lifestyle Analysis"
        description="Track and analyze your daily habits to build a healthier lifestyle."
        gradient="bg-coral"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {lifestyleMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-card border border-border p-5 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="font-display font-bold text-xl text-foreground">{metric.value}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target: {metric.target}</span>
                    <span className="font-medium text-foreground">{metric.progress}%</span>
                  </div>
                  <Progress value={metric.progress} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl shadow-card border border-border p-6"
              >
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                  Weekly Activity Overview
                </h3>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="steps" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Steps" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>No activity data yet. Start logging your daily activities!</p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl shadow-card border border-border p-6"
              >
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                  Sleep Patterns
                </h3>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          stroke="hsl(262, 83%, 58%)"
                          strokeWidth={3}
                          dot={{ fill: "hsl(262, 83%, 58%)", strokeWidth: 2, r: 5 }}
                          name="Hours of Sleep"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>No sleep data yet. Start tracking your sleep!</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Recommendations */}
              <div className="bg-card rounded-2xl shadow-card border border-border p-5">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border ${rec.priority === "high"
                            ? "bg-coral/5 border-coral/20"
                            : "bg-muted border-border"
                          }`}
                      >
                        <h4 className="font-medium text-sm text-foreground mb-1">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Start logging your activities to get personalized recommendations!
                    </p>
                  )}
                </div>
              </div>

              {/* Goals */}
              <div className="bg-card rounded-2xl shadow-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    Weekly Goals
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGoalsDialogOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {goals.length > 0 ? (
                    goals.slice(0, 4).map((goal) => (
                      <div key={goal.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{goal.title}</span>
                          <span className="font-medium text-foreground">
                            {Math.round(((goal.current_value || 0) / goal.target_value) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(100, ((goal.current_value || 0) / goal.target_value) * 100)}
                          className="h-2"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No goals set yet. Click the settings icon to create your first goal!
                    </p>
                  )}
                </div>
              </div>

              {/* Daily Check-in */}
              <div className="bg-gradient-to-br from-coral/10 to-warning/10 rounded-2xl p-5 border border-coral/20">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-coral" />
                  <h4 className="font-semibold text-foreground">Daily Check-in</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Log your meals, activities, and mood to get personalized insights.
                </p>
                <Button
                  className="w-full gradient-alert text-primary-foreground"
                  onClick={() => setCheckInModalOpen(true)}
                >
                  Log Today's Activities
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Modals */}
      {userId && (
        <>
          <DailyCheckInModal
            open={checkInModalOpen}
            onOpenChange={setCheckInModalOpen}
            userId={userId}
            onSuccess={handleCheckInSuccess}
          />
          <GoalManagementDialog
            open={goalsDialogOpen}
            onOpenChange={setGoalsDialogOpen}
            userId={userId}
            onSuccess={handleGoalsSuccess}
          />
        </>
      )}
    </Layout>
  );
}
