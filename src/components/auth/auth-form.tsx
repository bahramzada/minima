"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Brand } from "@/components/brand";
import {
  ApiError,
  forgotPassword,
  login,
  resendVerification,
  signUp,
} from "@/lib/api/client";

type Mode = "login" | "signup";

const notices: Record<string, { text: string; error?: boolean }> = {
  verified: { text: "E-poçtun təsdiqləndi. İndi daxil ola bilərsən." },
  password_reset: { text: "Şifrən yeniləndi. Yeni şifrənlə daxil ol." },
  invalid_link: { text: "Link etibarsızdır və ya vaxtı keçib.", error: true },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const notice = notices[useSearchParams().get("notice") ?? ""];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(notice?.text ?? "");
  const [isError, setIsError] = useState(Boolean(notice?.error));
  const [canResend, setCanResend] = useState(false);

  const isSignup = mode === "signup";

  function errorText(error: unknown) {
    return error instanceof Error ? error.message : "Xəta baş verdi.";
  }

  function setFeedback(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setCanResend(false);

    if (isSignup && name.trim().length < 2) {
      setFeedback("Adını ən azı 2 simvolla yaz.", true);
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setFeedback("Düzgün e-poçt ünvanı yaz.", true);
      return;
    }
    if (password.length < 8) {
      setFeedback("Şifrə ən azı 8 simvol olmalıdır.", true);
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signUp({ email: email.trim(), password, fullName: name.trim() });
        setFeedback("E-poçtunu yoxla və hesabını təsdiqləyən linkə toxun.");
        return;
      }
      await login(email.trim(), password);
      router.push("/app");
    } catch (error) {
      setFeedback(errorText(error), true);
      setCanResend(error instanceof ApiError && error.code === "email_not_verified");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await resendVerification(email.trim());
      setFeedback("Təsdiq linki yenidən göndərildi.");
      setCanResend(false);
    } catch (error) {
      setFeedback(errorText(error), true);
    }
  }

  async function resetPassword() {
    if (!email) {
      setFeedback("Əvvəlcə e-poçt ünvanını yaz.", true);
      return;
    }
    try {
      await forgotPassword(email.trim());
      setFeedback("Hesab varsa, şifrə yeniləmə linki e-poçtuna göndərildi.");
    } catch (error) {
      setFeedback(errorText(error), true);
    }
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
            disabled
            title="Tezliklə"
          >
            <span>G</span> Google ilə davam et (tezliklə)
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
                placeholder="ən azı 8 simvol"
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
                {canResend && (
                  <>
                    {" "}
                    <button className="forgot-button" type="button" onClick={resend}>
                      Linki yenidən göndər
                    </button>
                  </>
                )}
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
