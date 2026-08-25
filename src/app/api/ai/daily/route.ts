import { NextResponse } from "next/server";

import { allowDemoAi, hasSupabaseConfig } from "@/lib/config";
import { generateMicroTask } from "@/lib/openrouter";
import { getServerUser } from "@/lib/supabase/auth";
import { toDateKey } from "@/lib/utils/date";

export async function POST() {
  const today = toDateKey();
  const { supabase, userId } = await getServerUser();

  if (hasSupabaseConfig && (!supabase || !userId)) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  if (supabase && userId) {
    const { data: existing, error: existingError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_daily_task", true)
      .eq("source_date", today)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        habit: {
          id: existing.id,
          title: existing.title,
          emoji: existing.emoji,
          subtitle: existing.subtitle,
          category: existing.category,
          targetMinutes: existing.target_minutes,
          isAiGenerated: existing.is_ai_generated,
          isDailyTask: existing.is_daily_task,
          completedToday: false,
          createdAt: existing.created_at,
        },
        source: "database",
      });
    }
  }

  const generated = await generateMicroTask({
    allowRemote: Boolean(userId) || allowDemoAi,
  });

  if (supabase && userId) {
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        title: generated.task.task,
        emoji: generated.task.emoji,
        subtitle: `AI · ${generated.task.minutes} dəqiqə`,
        category: generated.task.category,
        target_minutes: generated.task.minutes,
        is_ai_generated: true,
        is_daily_task: true,
        source_date: today,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      habit: {
        id: data.id,
        title: data.title,
        emoji: data.emoji,
        subtitle: data.subtitle,
        category: data.category,
        targetMinutes: data.target_minutes,
        isAiGenerated: data.is_ai_generated,
        isDailyTask: data.is_daily_task,
        completedToday: false,
        createdAt: data.created_at,
      },
      source: generated.source,
    });
  }

  return NextResponse.json({ task: generated.task, source: generated.source });
}
