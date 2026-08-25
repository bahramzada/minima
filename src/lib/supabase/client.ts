import { createBrowserClient } from "@supabase/ssr";

import { hasSupabaseConfig } from "@/lib/config";
import type { Database } from "@/lib/supabase/database.types";

export function createBrowserSupabaseClient() {
  if (!hasSupabaseConfig) return null;

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
