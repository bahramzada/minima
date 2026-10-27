export type Habit = {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  category: string;
  targetMinutes: number;
  completedToday: boolean;
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
    avatarUrl: string | null;
    streakCount: number;
    locale: string;
    timezone: string;
  };
  habits: Habit[];
  moodLogs: MoodLog[];
  today: string;
  /** Seven entries ending today: 1 when at least one habit was completed. */
  weeklyActivity: number[];
  stats: {
    completedTotal: number;
    monthlyConsistency: number;
    activeHabits: number;
  };
};
