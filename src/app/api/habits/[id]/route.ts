import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerUser } from "@/lib/supabase/auth";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  emoji: z.string().trim().min(1).max(8),
  subtitle: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  targetMinutes: z.number().int().min(1).max(60),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Məlumat yanlışdır." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("habits")
    .update({
      title: parsed.data.title,
      emoji: parsed.data.emoji,
      subtitle: parsed.data.subtitle,
      category: parsed.data.category,
      target_minutes: parsed.data.targetMinutes,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_daily_task", false)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ habit: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) {
    return NextResponse.json({ error: "Daxil olmaq lazımdır." }, { status: 401 });
  }

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_daily_task", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
