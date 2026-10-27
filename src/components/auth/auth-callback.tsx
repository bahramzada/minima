"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Brand } from "@/components/brand";
import { resetPassword } from "@/lib/api/client";

/** Landing page of the links in Minima e-mails (`client=web`). */
export function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type");
  const [token] = useState(params.get("token") ?? "");
  const isRecovery = type === "recovery" && token.length > 0;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isRecovery) {
      // Keep the one-time token out of the address bar and history.
      window.history.replaceState(null, "", "/auth/callback?type=recovery");
    } else {
      router.replace(
        `/login?notice=${type === "verified" ? "verified" : "invalid_link"}`,
      );
    }
  }, [isRecovery, router, type]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Şifrə ən azı 8 simvol olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setMessage("Şifrə təsdiqi uyğun gəlmir.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      router.replace("/login?notice=password_reset");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Xəta baş verdi.");
      setLoading(false);
    }
  }

  if (!isRecovery) return null;

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <Brand />
        </div>
        <div className="auth-card">
          <h1>Yeni şifrə seç</h1>
          <p>Hesabın üçün ən azı 8 simvolluq yeni şifrə yaz.</p>
          <form onSubmit={submit}>
            <label>
              <span>Yeni şifrə</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label>
              <span>Şifrəni təsdiqlə</span>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
              />
            </label>
            {message && <div className="auth-message is-error">{message}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Bir an…" : "Şifrəni yenilə"}
            </button>
          </form>
          <div className="auth-switch">
            <Link href="/login">Daxil ol səhifəsinə qayıt</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
