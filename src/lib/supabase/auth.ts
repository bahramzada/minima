import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { supabase: null, userId: null };

  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (error || !userId) return { supabase, userId: null };
  return { supabase, userId };
}
