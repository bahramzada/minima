import { NextResponse } from "next/server";

import { getServerUser } from "@/lib/supabase/auth";
import { toDateKey } from "@/lib/utils/date";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const today = toDateKey();
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (habitError || !habit) {
    return NextResponse.json({ error: "Vərdiş tapılmadı." }, { status: 404 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", id)
    .eq("user_id", userId)
    .eq("completed_at", today)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  let completed = false;
  if (existing) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from("habit_logs").insert({
      user_id: userId,
      habit_id: id,
      completed_at: today,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    completed = true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    completed,
    streakCount: profile?.streak_count ?? 0,
  });
}
