import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerUser } from "@/lib/supabase/auth";

const habitSchema = z.object({
  title: z.string().trim().min(2).max(180),
  emoji: z.string().trim().min(1).max(8).default("🌱"),
  subtitle: z.string().trim().min(2).max(80).default("Kiçik addım"),
  category: z.string().trim().min(2).max(40).default("Ümumi"),
  targetMinutes: z.number().int().min(1).max(60).default(5),
});

export async function POST(request: Request) {
  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const parsed = habitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Məlumat yanlışdır." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      title: input.title,
      emoji: input.emoji,
      subtitle: input.subtitle,
      category: input.category,
      target_minutes: input.targetMinutes,
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
  });
}
