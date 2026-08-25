import type { DashboardData, Habit, MoodLog } from "@/components/app/types";
import { dateRange, toDateKey } from "@/lib/utils/date";

const createdAt = "2026-07-01T08:00:00.000Z";

export const demoHabits: Habit[] = [
  {
    id: "demo-read",
    title: "10 dəq kitab oxu",
    emoji: "📖",
    subtitle: "Diqqət · Sakitlik",
    category: "Diqqət",
    targetMinutes: 10,
    isAiGenerated: false,
    isDailyTask: false,
    completedToday: false,
    createdAt,
  },
  {
    id: "demo-walk",
    title: "20 dəq gəz",
    emoji: "🚶",
    subtitle: "Hərəkət",
    category: "Hərəkət",
    targetMinutes: 20,
    isAiGenerated: false,
    isDailyTask: false,
    completedToday: true,
    createdAt,
  },
  {
    id: "demo-water",
    title: "2 stəkan su iç",
    emoji: "💧",
    subtitle: "Enerji",
    category: "Enerji",
    targetMinutes: 2,
    isAiGenerated: false,
    isDailyTask: false,
    completedToday: false,
    createdAt,
  },
  {
    id: "demo-meditation",
    title: "5 dəq meditasiya",
    emoji: "🧘",
    subtitle: "Sakitlik",
    category: "Sakitlik",
    targetMinutes: 5,
    isAiGenerated: false,
    isDailyTask: false,
    completedToday: false,
    createdAt,
  },
];

function buildMoodLogs(): MoodLog[] {
  const today = toDateKey();
  const levels = [2, 3, 1, 4, 2, 0, 3, 1, 2, 4, 3, 1, 2, 3, 0, 4, 2];
  const emojis = ["😴", "😐", "🙂", "😊", "🤩"];

  return dateRange(today, 119)
    .slice(0, 111)
    .map((date, index) => {
      const level = levels[index % levels.length];
      return { date, level, emoji: emojis[level] };
    });
}

export function buildDemoDashboard(): DashboardData {
  return {
    profile: {
      id: "demo-user",
      fullName: "Aysel Məmmədova",
      email: "aysel@minima.demo",
      streakCount: 12,
    },
    habits: demoHabits,
    dailyTask: {
      id: "demo-daily-task",
      title: "3 dəqiqə pəncərədən bayıra bax və dərin nəfəs al",
      emoji: "🌿",
      subtitle: "AI bugünkü ritminə uyğun seçdi",
      category: "Sakitlik",
      targetMinutes: 3,
      isAiGenerated: true,
      isDailyTask: true,
      completedToday: false,
      createdAt: new Date().toISOString(),
    },
    moodLogs: buildMoodLogs(),
    weeklyActivity: [1, 1, 0, 1, 1, 1, 0],
    stats: {
      completedTotal: 84,
      monthlyConsistency: 91,
      activeHabits: 7,
    },
  };
}
