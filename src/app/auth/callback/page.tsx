import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCallback } from "@/components/auth/auth-callback";

export const metadata: Metadata = { title: "Minima" };

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
