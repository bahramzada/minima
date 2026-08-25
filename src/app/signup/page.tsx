import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Hesab yarat" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
