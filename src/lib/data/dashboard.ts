import type { DashboardData, Habit, MoodLog } from "@/components/app/types";
import type { Database } from "@/lib/supabase/database.types";
import { addDays, startOfMonth, toDateKey } from "@/lib/utils/date";
import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient<Database>;

function mapHabit(
  row: Database["public"]["Tables"]["habits"]["Row"],
  completedIds: Set<string>,
): Habit {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    subtitle: row.subtitle,
    category: row.category,
    targetMinutes: row.target_minutes,
    isAiGenerated: row.is_ai_generated,
    isDailyTask: row.is_daily_task,
    completedToday: completedIds.has(row.id),
    createdAt: row.created_at,
  };
}

export async function getDashboardData(
  supabase: Client,
  userId: string,
): Promise<DashboardData> {
  const today = toDateKey();
  const gridStart = addDays(today, -118);
  const weekStart = addDays(today, -6);
  const monthStart = startOfMonth(today);

  const [
    profileResult,
    habitsResult,
    todayLogsResult,
    historyResult,
    totalLogsResult,
    moodResult,
  ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", userId)
        .eq("completed_at", today),
      supabase
        .from("habit_logs")
        .select("completed_at, habit_id")
        .eq("user_id", userId)
        .gte("completed_at", gridStart),
      supabase
        .from("habit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("mood_logs")
        .select("logged_date, mood_emoji, mood_level")
        .eq("user_id", userId)
        .gte("logged_date", gridStart)
        .order("logged_date", { ascending: true }),
    ]);

  const firstError = [
    profileResult.error,
    habitsResult.error,
    todayLogsResult.error,
    historyResult.error,
    totalLogsResult.error,
    moodResult.error,
  ].find(Boolean);

  if (firstError) throw firstError;

  const completedIds = new Set(
    (todayLogsResult.data || []).map((log) => log.habit_id),
  );
  const mappedHabits = (habitsResult.data || []).map((habit) =>
    mapHabit(habit, completedIds),
  );

  const regularHabits = mappedHabits.filter((habit) => !habit.isDailyTask);
  const dailyTask =
    mappedHabits.find(
      (habit) =>
        habit.isDailyTask &&
        (habitsResult.data || []).find((row) => row.id === habit.id)?.source_date ===
          today,
    ) || null;

  const history = historyResult.data || [];
  const activeDates = new Set(history.map((log) => log.completed_at));
  const weeklyActivity = Array.from({ length: 7 }, (_, index) =>
    activeDates.has(addDays(weekStart, index)) ? 1 : 0,
  );
  const completedTotal = totalLogsResult.count || 0;
  const elapsedMonthDays = Math.max(1, Number(today.slice(8, 10)));
  const activeMonthDays = new Set(
    history
      .filter((log) => log.completed_at >= monthStart)
      .map((log) => log.completed_at),
  ).size;

  const moodLogs: MoodLog[] = (moodResult.data || []).map((log) => ({
    date: log.logged_date,
    emoji: log.mood_emoji,
    level: log.mood_level,
  }));

  const profile = profileResult.data;

  return {
    profile: {
      id: userId,
      fullName: profile?.full_name || profile?.email?.split("@")[0] || "Dost",
      email: profile?.email || "",
      avatarUrl: profile?.avatar_url || null,
      streakCount: profile?.streak_count || 0,
    },
    habits: regularHabits,
    dailyTask,
    moodLogs,
    weeklyActivity,
    stats: {
      completedTotal,
      monthlyConsistency: Math.min(
        100,
        Math.round((activeMonthDays / elapsedMonthDays) * 100),
      ),
      activeHabits: regularHabits.length,
    },
  };
}
