import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerUser } from "@/lib/supabase/auth";
import { toDateKey } from "@/lib/utils/date";

const moodSchema = z.object({
  emoji: z.string().min(1).max(8),
  level: z.number().int().min(0).max(4),
});

export async function POST(request: Request) {
  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const parsed = moodSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Əhval seçimi yanlışdır." }, { status: 400 });
  }

  const loggedDate = toDateKey();
  const { data, error } = await supabase
    .from("mood_logs")
    .upsert(
      {
        user_id: userId,
        mood_emoji: parsed.data.emoji,
        mood_level: parsed.data.level,
        logged_date: loggedDate,
      },
      { onConflict: "user_id,logged_date" },
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mood: data });
}
