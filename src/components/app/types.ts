export type AppMode = "demo" | "supabase" | "setup";

export type Habit = {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  category: string;
  targetMinutes: number;
  isAiGenerated: boolean;
  isDailyTask: boolean;
  completedToday: boolean;
  createdAt: string;
};

export type MoodLog = {
  date: string;
  emoji: string;
  level: number;
};

export type DashboardData = {
  profile: {
    id: string;
    fullName: string;
    email: string;
    streakCount: number;
  };
  habits: Habit[];
  dailyTask: Habit | null;
  moodLogs: MoodLog[];
  weeklyActivity: number[];
  stats: {
    completedTotal: number;
    monthlyConsistency: number;
    activeHabits: number;
  };
};

export type AiTaskPayload = {
  task: string;
  emoji: string;
  minutes: number;
  category: string;
};
