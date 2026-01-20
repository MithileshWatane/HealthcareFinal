import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Watch, Heart, Activity, Moon, Footprints, Flame, TrendingUp, AlertTriangle, LogIn, LogOut, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useFitbitAuth } from "@/hooks/useFitbitAuth";
import { FitbitService } from "@/services/fitbitService";

interface HealthData {
  heartRate: any[];
  steps: number;
  calories: number;
  sleepScore: number;
  restingHeartRate: number;
  sleepWeekly: any[];
}

export default function HealthPrediction() {
  const { accessToken, isAuthenticated, isLoading: authLoading, login, logout } = useFitbitAuth();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchHealthData();
    }
  }, [isAuthenticated, accessToken]);

  const fetchHealthData = async () => {
    if (!accessToken) return;

    setDataLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [heartRateData, activityData, sleepData, hrvData] = await Promise.all([
        FitbitService.getHeartRateData(accessToken),
        FitbitService.getActivitySummary(accessToken),
        FitbitService.getSleepData(accessToken),
        FitbitService.getHRVData(accessToken).catch(() => null), // HRV might not be available
      ]);

      // Format heart rate data for chart
      const formattedHeartRate = FitbitService.formatHeartRateForChart(heartRateData);

      // Get resting heart rate
      const restingHR = heartRateData['activities-heart']?.[0]?.value?.restingHeartRate || 78;

      // Get activity metrics
      const summary = activityData.summary;
      const steps = summary.steps || 0;
      const calories = summary.caloriesOut || 0;

      // Calculate sleep score
      const sleepScore = FitbitService.calculateSleepScore(sleepData);

      // Fetch weekly sleep data
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      let sleepWeekly: any[] = [];
      try {
        const sleepRange = await FitbitService.getSleepRange(
          accessToken,
          formatDate(weekAgo),
          formatDate(today)
        );

        // Format weekly sleep data
        sleepWeekly = sleepRange.sleep.slice(-7).map((sleep: any) => {
          const levels = sleep.levels.summary;
          return {
            day: new Date(sleep.dateOfSleep).toLocaleDateString('en', { weekday: 'short' }),
            deep: (levels.deep?.minutes || 0) / 60,
            light: (levels.light?.minutes || 0) / 60,
            rem: (levels.rem?.minutes || 0) / 60,
          };
        });
      } catch (sleepRangeError) {
        console.error('Could not fetch weekly sleep data:', sleepRangeError);
        // Use empty array if sleep range fails
        sleepWeekly = [];
      }

      setHealthData({
        heartRate: formattedHeartRate,
        steps,
        calories,
        sleepScore,
        restingHeartRate: restingHR,
        sleepWeekly,
      });
    } catch (err: any) {
      console.error('Error fetching health data:', err);
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to fetch health data');
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate predictions based on real data
  const predictions = healthData ? [
    {
      title: "Cardiovascular Health",
      score: Math.min(100, Math.max(0, 100 - (healthData.restingHeartRate - 60) * 2)),
      status: "good",
      message: `Your resting heart rate of ${healthData.restingHeartRate} bpm indicates ${healthData.restingHeartRate < 70 ? 'good' : 'moderate'} cardiovascular health.`,
    },
    {
      title: "Sleep Quality",
      score: healthData.sleepScore,
      status: healthData.sleepScore >= 80 ? "good" : "moderate",
      message: `Your sleep efficiency is ${healthData.sleepScore >= 80 ? 'excellent' : 'moderate'}. ${healthData.sleepScore < 80 ? 'Try maintaining a consistent sleep schedule.' : 'Keep up the good work!'}`,
    },
    {
      title: "Activity Level",
      score: Math.min(100, (healthData.steps / 10000) * 100),
      status: healthData.steps >= 8000 ? "good" : "moderate",
      message: `You've achieved ${((healthData.steps / 10000) * 100).toFixed(0)}% of your daily step goal.`,
    },
  ] : [];

  const metrics = healthData ? [
    { 
      icon: Heart, 
      label: "Resting HR", 
      value: healthData.restingHeartRate.toString(), 
      unit: "bpm", 
      color: "text-coral", 
      bg: "bg-coral/10", 
      trend: "" 
    },
    { 
      icon: Footprints, 
      label: "Steps Today", 
      value: healthData.steps.toLocaleString(), 
      unit: "steps", 
      color: "text-primary", 
      bg: "bg-primary/10", 
      trend: `${Math.round((healthData.steps / 10000) * 100)}%` 
    },
    { 
      icon: Moon, 
      label: "Sleep Score", 
      value: healthData.sleepScore.toString(), 
      unit: "/100", 
      color: "text-purple", 
      bg: "bg-purple/10", 
      trend: "" 
    },
    { 
      icon: Flame, 
      label: "Calories", 
      value: healthData.calories.toLocaleString(), 
      unit: "kcal", 
      color: "text-warning", 
      bg: "bg-warning/10", 
      trend: "" 
    },
  ] : [];

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <PageHeader
          icon={Watch}
          title="Health Prediction"
          description="Connect your Fitbit to get AI-powered health insights."
          gradient="bg-success"
        />
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-card rounded-2xl shadow-card border border-border p-8 max-w-md text-center">
            <Watch className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl mb-2">Connect Your Fitbit</h3>
            <p className="text-muted-foreground mb-6">
              Sign in with your Fitbit account to view your real-time health data and receive personalized insights.
            </p>
            <button
              onClick={login}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Connect Fitbit
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          icon={Watch}
          title="Health Prediction"
          description="AI-powered health insights based on your Fitbit data."
          gradient="bg-success"
        />
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>

      {dataLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading your health data...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {healthData && !dataLoading && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-card border border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  {metric.trend && (
                    <span className="text-xs font-medium text-success">{metric.trend}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {metric.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              {healthData.heartRate.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl shadow-card border border-border p-6"
                >
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Heart Rate (24h)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={healthData.heartRate}>
                        <defs>
                          <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[40, 120]} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(12, 76%, 61%)"
                          fill="url(#heartGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {healthData.sleepWeekly && healthData.sleepWeekly.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl shadow-card border border-border p-6"
                >
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Sleep Patterns (Weekly)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData.sleepWeekly}>
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
                        <Line type="monotone" dataKey="deep" stroke="hsl(262, 83%, 58%)" strokeWidth={2} dot={{ r: 4 }} name="Deep Sleep" />
                        <Line type="monotone" dataKey="light" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} name="Light Sleep" />
                        <Line type="monotone" dataKey="rem" stroke="hsl(172, 66%, 45%)" strokeWidth={2} dot={{ r: 4 }} name="REM" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Predictions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Health Predictions
                </h3>
                <div className="space-y-4">
                  {predictions.map((pred) => (
                    <div key={pred.title} className="p-4 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{pred.title}</span>
                        <span
                          className={`text-sm font-semibold ${
                            pred.score >= 80 ? "text-success" : pred.score >= 60 ? "text-warning" : "text-destructive"
                          }`}
                        >
                          {Math.round(pred.score)}/100
                        </span>
                      </div>
                      <Progress value={pred.score} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">{pred.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {healthData.restingHeartRate > 75 && (
                <div className="bg-gradient-to-br from-warning/10 to-coral/10 rounded-2xl p-5 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Health Alert</h4>
                      <p className="text-sm text-muted-foreground">
                        Your resting heart rate is slightly elevated. Consider reducing caffeine intake and ensuring adequate rest.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </Layout>
  );
}