import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Target, Zap, Timer, Users, Star, Play, Lock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MentalHealthGames, GameType } from "@/components/mental-health/MentalHealthGames";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const games = [
  {
    id: 1,
    title: "Memory Match",
    description: "Train your brain with memory card matching",
    category: "Cognitive",
    difficulty: "Easy",
    duration: "5 min",
    points: 50,
    unlocked: true,
  },
  {
    id: 2,
    title: "Breathing Challenge",
    description: "Follow breathing patterns for relaxation",
    category: "Relaxation",
    difficulty: "Easy",
    duration: "3 min",
    points: 30,
    unlocked: true,
  },
  {
    id: 3,
    title: "Step Counter Race",
    description: "Compete with friends in daily step challenges",
    category: "Physical",
    difficulty: "Medium",
    duration: "All Day",
    points: 100,
    unlocked: true,
  },
  {
    id: 4,
    title: "Yoga Flow",
    description: "Follow along with guided yoga sessions",
    category: "Physical",
    difficulty: "Medium",
    duration: "15 min",
    points: 75,
    unlocked: false,
  },
  {
    id: 5,
    title: "Brain Teasers",
    description: "Solve puzzles to sharpen your mind",
    category: "Cognitive",
    difficulty: "Hard",
    duration: "10 min",
    points: 80,
    unlocked: false,
  },
];

const exercises = [
  { name: "Morning Stretch", duration: "10 min", completed: true, calories: 45 },
  { name: "Desk Exercises", duration: "5 min", completed: true, calories: 25 },
  { name: "Evening Walk", duration: "30 min", completed: false, calories: 120 },
];

const achievements = [
  { name: "First Steps", description: "Complete your first exercise", icon: Star, unlocked: true },
  { name: "Week Warrior", description: "7-day streak", icon: Zap, unlocked: true },
  { name: "Brain Master", description: "Win 10 brain games", icon: Trophy, unlocked: false },
];

export default function Games() {
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGameClick = (gameId: number) => {
    // Map game IDs to game types
    const gameMap: { [key: number]: GameType } = {
      1: 'memory',
      2: 'breathing',
      3: 'affirmation', // Step Counter Race -> Affirmation Builder
    };

    const gameType = gameMap[gameId];
    if (gameType) {
      setSelectedGame(gameType);
      setGameModalOpen(true);
    } else {
      toast({
        title: "Coming Soon!",
        description: "This game will be available in a future update.",
      });
    }
  };

  const handleGameComplete = () => {
    setGameModalOpen(false);
    setSelectedGame(null);
    toast({
      title: "Great job!",
      description: "You completed the game!",
    });
  };

  return (
    <Layout>
      <PageHeader
        icon={Gamepad2}
        title="Games & Exercise"
        description="Fun, interactive activities to boost your physical and mental wellness."
        gradient="bg-warning"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Games Grid */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6 mb-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-6">
              Health Games
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => game.unlocked && handleGameClick(game.id)}
                  className={cn(
                    "relative p-5 rounded-xl border-2 transition-all",
                    game.unlocked
                      ? "border-border hover:border-primary cursor-pointer hover:shadow-lg"
                      : "border-border/50 opacity-60"
                  )}
                >
                  {!game.unlocked && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {game.category}
                    </span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {game.difficulty}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{game.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      {game.duration}
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="w-4 h-4 fill-warning" />
                      <span className="text-sm font-medium">{game.points} pts</span>
                    </div>
                  </div>
                  {game.unlocked && (
                    <Button
                      className="w-full mt-4 gradient-primary text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGameClick(game.id);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Today's Exercises */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-6">
              Today's Exercises
            </h3>
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                    exercise.completed ? "bg-success/5 border-success/20" : "bg-muted border-border"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      exercise.completed ? "bg-success" : "bg-muted-foreground/20"
                    )}
                  >
                    {exercise.completed ? (
                      <Zap className="w-5 h-5 text-success-foreground" />
                    ) : (
                      <Target className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exercise.duration} · {exercise.calories} cal
                    </p>
                  </div>
                  {!exercise.completed && (
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-warning/10 to-coral/10 rounded-2xl p-5 border border-warning/20">
            <h3 className="font-display font-semibold text-foreground mb-4">Weekly Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Points Earned</span>
                  <span className="font-medium text-foreground">420 / 500</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-medium text-foreground">12 / 15</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Exercise Minutes</span>
                  <span className="font-medium text-foreground">85 / 150</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    achievement.unlocked ? "bg-warning/10" : "bg-muted opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      achievement.unlocked ? "bg-warning" : "bg-muted-foreground/20"
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        "w-5 h-5",
                        achievement.unlocked ? "text-warning-foreground" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">Leaderboard</h3>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, name: "Sarah M.", points: 1250 },
                { rank: 2, name: "John D.", points: 1180 },
                { rank: 3, name: "You", points: 1050, isYou: true },
                { rank: 4, name: "Emily R.", points: 980 },
              ].map((user) => (
                <div
                  key={user.rank}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    user.isYou && "bg-primary/10"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      user.rank === 1
                        ? "bg-warning text-warning-foreground"
                        : user.rank === 2
                          ? "bg-muted-foreground text-muted"
                          : user.rank === 3
                            ? "bg-coral text-coral-foreground"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {user.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-sm text-muted-foreground">{user.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game Modal */}
      <Dialog open={gameModalOpen} onOpenChange={setGameModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGame === 'memory' && 'Memory Match Game'}
              {selectedGame === 'breathing' && 'Breathing Bubble Game'}
              {selectedGame === 'affirmation' && 'Affirmation Builder'}
            </DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <MentalHealthGames
              gameType={selectedGame}
              userId={user?.id}
              onGameComplete={handleGameComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
