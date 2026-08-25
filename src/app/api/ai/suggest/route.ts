import { NextResponse } from "next/server";
import { z } from "zod";

import { allowDemoAi, hasSupabaseConfig } from "@/lib/config";
import { generateMicroTask } from "@/lib/openrouter";
import { getServerUser } from "@/lib/supabase/auth";

const requestSchema = z
  .object({
    mood: z.string().trim().min(2).max(40).optional(),
    message: z.string().trim().min(2).max(240).optional(),
  })
  .refine((value) => value.mood || value.message, {
    message: "Əhval və ya qısa təsvir yazılmalıdır.",
  });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Yanlış sorğu." },
      { status: 400 },
    );
  }

  const { supabase, userId } = await getServerUser();
  if (hasSupabaseConfig && (!supabase || !userId)) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const generated = await generateMicroTask({
    ...parsed.data,
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
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      task: generated.task,
      habit: {
        id: data.id,
        title: data.title,
        emoji: data.emoji,
        subtitle: data.subtitle,
        category: data.category,
        targetMinutes: data.target_minutes,
        isAiGenerated: true,
        isDailyTask: false,
        completedToday: false,
        createdAt: data.created_at,
      },
      source: generated.source,
    });
  }

  return NextResponse.json({ task: generated.task, source: generated.source });
}
