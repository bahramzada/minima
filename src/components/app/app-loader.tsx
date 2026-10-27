"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MinimaApp } from "@/components/app/minima-app";
import type { DashboardData } from "@/components/app/types";
import { ApiError } from "@/lib/api/client";
import { fetchDashboard } from "@/lib/api/dashboard";

/** Signs the visitor in from the session cookie, then loads the dashboard. */
export function AppLoader() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((dashboard) => {
        if (!cancelled) setData(dashboard);
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.replace("/login");
          return;
        }
        setError(
          failure instanceof Error ? failure.message : "Məlumat yüklənmədi.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (data) return <MinimaApp initialData={data} />;

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <p>{error || "Yüklənir…"}</p>
          {error && (
            <button
              className="auth-submit"
              type="button"
              onClick={() => window.location.reload()}
            >
              Yenidən cəhd et
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
