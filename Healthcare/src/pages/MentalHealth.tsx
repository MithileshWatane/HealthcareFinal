import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Gamepad2, ClipboardList, Activity, BarChart3,
  Smile, Battery, MessageSquare, Users, Wind, BookOpen, Moon
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// Game Components
import { EmotionRecognitionGame } from '@/components/mental-health/games/EmotionRecognitionGame';
import { AttentionFocusGame } from '@/components/mental-health/games/AttentionFocusGame';
import { StressResponseGame } from '@/components/mental-health/games/StressResponseGame';
import { DecisionMakingGame } from '@/components/mental-health/games/DecisionMakingGame';

// Daily Check-in Components
import { MoodSlider } from '@/components/mental-health/forms/MoodSlider';
import { EnergyMotivationScale } from '@/components/mental-health/forms/EnergyMotivationScale';
import { ThoughtPatternReflection } from '@/components/mental-health/forms/ThoughtPatternReflection';
import { SocialInteractionCheck } from '@/components/mental-health/forms/SocialInteractionCheck';

// Guided Activity Components
import { BreathingExercise } from '@/components/mental-health/activities/BreathingExercise';
import { AIJournaling } from '@/components/mental-health/activities/AIJournaling';
import { SleepReflection } from '@/components/mental-health/activities/SleepReflection';

// Analytics
import { MentalHealthAnalytics } from '@/components/mental-health/MentalHealthAnalytics';

const GAMES = [
  {
    id: 'emotion',
    title: 'Emotion Recognition',
    description: 'Identify emotions quickly and accurately',
    icon: Smile,
    color: 'text-purple',
    gradient: 'gradient-mental'
  },
  {
    id: 'attention',
    title: 'Attention & Focus',
    description: 'Test your cognitive abilities',
    icon: Brain,
    color: 'text-primary',
    gradient: 'gradient-primary'
  },
  {
    id: 'stress',
    title: 'Stress Response',
    description: 'Perform under pressure',
    icon: Activity,
    color: 'text-warning',
    gradient: 'bg-warning'
  },
  {
    id: 'decision',
    title: 'Decision Making',
    description: 'Choose between safe and risky rewards',
    icon: BarChart3,
    color: 'text-coral',
    gradient: 'bg-coral'
  },
];

const CHECK_INS = [
  {
    id: 'mood',
    title: 'Mood Slider',
    description: 'Track your daily mood',
    icon: Smile,
    color: 'text-purple'
  },
  {
    id: 'energy',
    title: 'Energy & Motivation',
    description: 'Monitor your energy levels',
    icon: Battery,
    color: 'text-warning'
  },
  {
    id: 'thoughts',
    title: 'Thought Patterns',
    description: 'Reflect on recurring thoughts',
    icon: MessageSquare,
    color: 'text-primary'
  },
  {
    id: 'social',
    title: 'Social Connection',
    description: 'Track social interactions',
    icon: Users,
    color: 'text-success'
  },
];

const ACTIVITIES = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Guided breathing for stress relief',
    icon: Wind,
    color: 'text-primary'
  },
  {
    id: 'journaling',
    title: 'AI Journaling',
    description: 'Reflect with guided prompts',
    icon: BookOpen,
    color: 'text-purple'
  },
  {
    id: 'sleep',
    title: 'Sleep Reflection',
    description: 'Track your sleep quality',
    icon: Moon,
    color: 'text-primary'
  },
];

export default function MentalHealth() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user } = useAuth();

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const renderModalContent = () => {
    if (!activeModal) return null;

    const modalComponents: Record<string, JSX.Element> = {
      // Games
      emotion: <EmotionRecognitionGame userId={user?.id} onComplete={handleModalClose} />,
      attention: <AttentionFocusGame userId={user?.id} onComplete={handleModalClose} />,
      stress: <StressResponseGame userId={user?.id} onComplete={handleModalClose} />,
      decision: <DecisionMakingGame userId={user?.id} onComplete={handleModalClose} />,

      // Check-ins
      mood: <MoodSlider userId={user?.id} onComplete={handleModalClose} />,
      energy: <EnergyMotivationScale userId={user?.id} onComplete={handleModalClose} />,
      thoughts: <ThoughtPatternReflection userId={user?.id} onComplete={handleModalClose} />,
      social: <SocialInteractionCheck userId={user?.id} onComplete={handleModalClose} />,

      // Activities
      breathing: <BreathingExercise userId={user?.id} onComplete={handleModalClose} />,
      journaling: <AIJournaling userId={user?.id} onComplete={handleModalClose} />,
      sleep: <SleepReflection userId={user?.id} onComplete={handleModalClose} />,
    };

    return modalComponents[activeModal];
  };

  const getModalTitle = () => {
    const allItems = [...GAMES, ...CHECK_INS, ...ACTIVITIES];
    const item = allItems.find(i => i.id === activeModal);
    return item?.title || '';
  };

  return (
    <Layout>
      <PageHeader
        icon={Brain}
        title="Mental Health"
        description="Track your emotional well-being through games, daily check-ins, and guided activities."
        gradient="gradient-mental"
      />

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Games</span>
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Check-ins</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">🎮 Game-Based Activities</h3>
            <p className="text-sm text-muted-foreground">
              These games collect behavioral data to understand your emotional perception, cognitive abilities, stress tolerance, and decision-making patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple/50"
                  onClick={() => setActiveModal(game.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${game.color.split('-')[1]}/10 flex items-center justify-center`}>
                      <game.icon className={`w-6 h-6 ${game.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{game.title}</h3>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins" className="space-y-6">
          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">📋 Daily Check-ins</h3>
            <p className="text-sm text-muted-foreground">
              Quick daily forms to track your mood, energy, thoughts, and social connections. These help identify patterns over time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {CHECK_INS.map((checkIn, index) => (
              <motion.div
                key={checkIn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                  onClick={() => setActiveModal(checkIn.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${checkIn.color.split('-')[1]}/10 flex items-center justify-center`}>
                      <checkIn.icon className={`w-6 h-6 ${checkIn.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{checkIn.title}</h3>
                      <p className="text-sm text-muted-foreground">{checkIn.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">🧘 Guided Activities</h3>
            <p className="text-sm text-muted-foreground">
              Therapeutic activities that both help you feel better and provide valuable data about your mental health patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ACTIVITIES.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                  onClick={() => setActiveModal(activity.id)}
                >
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-${activity.color.split('-')[1]}/10 flex items-center justify-center`}>
                      <activity.icon className={`w-8 h-8 ${activity.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">📊 Mental Health Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View your mental health scores, trends, and insights based on your activities and check-ins.
            </p>
          </div>

          {user ? (
            <MentalHealthAnalytics userId={user.id} />
          ) : (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Sign in to view analytics</h3>
              <p className="text-sm text-muted-foreground">
                Create an account to track your mental health data and view personalized insights.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal for Games, Check-ins, and Activities */}
      <Dialog open={activeModal !== null} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderModalContent()}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
