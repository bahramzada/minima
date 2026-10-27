import type { HabitInput } from "@/components/app/habit-modal";
import type { DashboardData, Habit } from "@/components/app/types";
import { apiRequest } from "@/lib/api/client";


export const fetchDashboard = () => apiRequest<DashboardData>("/dashboard");

/** Writes the desired final state, so retries are idempotent. Returns the fresh streak. */
export async function setHabitCompletion(
  habitId: string,
  date: string,
  completed: boolean,
) {
  const result = await apiRequest<{ streak: number }>(
    `/habits/${habitId}/completions/${date}`,
    { method: "PUT", body: { completed } },
  );
  return result.streak;
}

export const saveMoodLog = (date: string, emoji: string, level: number) =>
  apiRequest<void>(`/moods/${date}`, { method: "PUT", body: { emoji, level } });

export async function insertHabit(input: HabitInput) {
  const result = await apiRequest<{ habit: Habit }>("/habits", {
    method: "POST",
    body: input,
  });
  return result.habit;
}

export const patchHabit = (habitId: string, input: HabitInput) =>
  apiRequest<void>(`/habits/${habitId}`, { method: "PATCH", body: input });

export const removeHabit = (habitId: string) =>
  apiRequest<void>(`/habits/${habitId}`, { method: "DELETE" });

export const patchProfile = (patch: { fullName?: string }) =>
  apiRequest<void>("/me", { method: "PATCH", body: patch });

export async function uploadAvatar(file: File) {
  const result = await apiRequest<{ user: { avatarUrl: string | null } }>(
    "/me/avatar",
    { method: "PUT", raw: file },
  );
  return result.user.avatarUrl;
}

export const removeAvatar = () =>
  apiRequest<void>("/me/avatar", { method: "DELETE" });

export const deleteAccount = (password: string) =>
  apiRequest<void>("/me", { method: "DELETE", body: { password } });
