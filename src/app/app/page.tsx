import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MinimaApp } from "@/components/app/minima-app";
import type { AppMode } from "@/components/app/types";
import { hasSupabaseConfig } from "@/lib/config";
import { getDashboardData } from "@/lib/data/dashboard";
import { buildDemoDashboard } from "@/lib/data/demo";
import { getServerUser } from "@/lib/supabase/auth";

export const metadata: Metadata = { title: "Bu gün" };
export const dynamic = "force-dynamic";

export default async function AppPage() {
  if (!hasSupabaseConfig) {
    return <MinimaApp initialData={buildDemoDashboard()} mode="demo" />;
  }

  const { supabase, userId } = await getServerUser();
  if (!supabase || !userId) redirect("/login");

  let mode: AppMode = "supabase";
  let dashboardData;
  let setupError: string | undefined;

  try {
    dashboardData = await getDashboardData(supabase, userId);
  } catch (error) {
    mode = "setup";
    setupError = error instanceof Error ? error.message : "Supabase sxemi hazır deyil.";
  }

  if (dashboardData) {
    return <MinimaApp initialData={dashboardData} mode={mode} />;
  }

  return (
    <MinimaApp
      initialData={buildDemoDashboard()}
      mode={mode}
      setupError={setupError}
    />
  );
}
