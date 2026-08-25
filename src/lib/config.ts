export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const appTimeZone = process.env.APP_TIMEZONE || "Asia/Baku";

export const allowDemoAi = process.env.ALLOW_DEMO_AI === "true";

export const openRouterModel =
  process.env.OPENROUTER_MODEL || "google/gemma-3-4b-it";
