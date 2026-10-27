import type { Metadata } from "next";

import { AppLoader } from "@/components/app/app-loader";

export const metadata: Metadata = { title: "Bu gün" };

export default function AppPage() {
  return <AppLoader />;
}
