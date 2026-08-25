"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brand } from "@/components/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const isSignup = mode === "signup";

  function setFeedback(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (isSignup && name.trim().length < 2) {
      setFeedback("Adını ən azı 2 simvolla yaz.", true);
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setFeedback("Düzgün e-poçt ünvanı yaz.", true);
      return;
    }
    if (password.length < 6) {
      setFeedback("Şifrə ən azı 6 simvol olmalıdır.", true);
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      localStorage.setItem(
        "minima-demo-profile",
        JSON.stringify({ fullName: name.trim() || "Aysel Məmmədova", email }),
      );
      router.push("/app");
      return;
    }

    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) {
      setFeedback(result.error.message, true);
      return;
    }

    if (isSignup && !result.data.session) {
      setFeedback("E-poçtunu yoxla və hesabını təsdiqlə.");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  async function continueWithGoogle() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      router.push("/app");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    });
    if (error) {
      setLoading(false);
      setFeedback(error.message, true);
    }
  }

  async function resetPassword() {
    if (!email) {
      setFeedback("Əvvəlcə e-poçt ünvanını yaz.", true);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setFeedback("Demo rejimində şifrə sıfırlama tələb olunmur.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setFeedback(
      error ? error.message : "Şifrə yeniləmə linki e-poçtuna göndərildi.",
      Boolean(error),
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <Brand />
        </div>
        <div className="auth-card">
          <h1>{isSignup ? "Hesab yarat" : "Yenidən xoş gəldin"}</h1>
          <p>
            {isSignup
              ? "30 saniyə. İlk minimalın səni gözləyir. 🌱"
              : "Seriyanı davam etdirmək üçün daxil ol."}
          </p>

          <button
            type="button"
            className="google-button"
            onClick={continueWithGoogle}
            disabled={loading}
          >
            <span>G</span> Google ilə davam et
          </button>

          <div className="auth-separator">
            <i /> <span>və ya</span> <i />
          </div>

          <form onSubmit={submit}>
            {isSignup && (
              <label>
                <span>Ad</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Aysel Məmmədova"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              <span>E-poçt</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ad@nümunə.az"
                autoComplete="email"
              />
            </label>
            <label>
              <span>Şifrə</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="ən azı 6 simvol"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>

            {!isSignup && (
              <button
                className="forgot-button"
                type="button"
                onClick={resetPassword}
              >
                Şifrəni unutdun?
              </button>
            )}

            {message && (
              <div className={`auth-message ${isError ? "is-error" : ""}`}>
                {message}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Bir an…" : isSignup ? "Hesab yarat" : "Daxil ol"}
            </button>
          </form>

          {isSignup && (
            <div className="terms-note">
              Davam etməklə Şərtlər və Gizlilik Siyasəti ilə razılaşırsan.
            </div>
          )}

          <div className="auth-switch">
            {isSignup ? "Hesabın var?" : "Hesabın yoxdur?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Daxil ol" : "Qeydiyyatdan keç"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
