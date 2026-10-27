import { NextResponse } from "next/server";

export const sessionCookie = "minima_session";
const refreshTokenDays = 60;

const apiBase = () =>
  (process.env.API_INTERNAL_URL || "http://localhost:8080").replace(/\/$/, "");

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: unknown;
};

/** The refresh token travels in an httpOnly cookie only; scripts never see it. */
export function sessionResponse(payload: SessionPayload) {
  const response = NextResponse.json(
    {
      accessToken: payload.accessToken,
      expiresIn: payload.expiresIn,
      user: payload.user,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(sessionCookie, payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/session",
    maxAge: refreshTokenDays * 24 * 60 * 60,
  });
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/session",
    maxAge: 0,
  });
  return response;
}

export function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/** Rejects cross-site browser requests to the cookie-backed endpoints. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function callApi(
  request: Request,
  path: string,
  options: { body?: unknown; token?: string | null } = {},
) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  // The API rate-limits per client address; pass the visitor's, not ours.
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) headers["cf-connecting-ip"] = ip;
  if (options.token) headers.authorization = `Bearer ${options.token}`;

  try {
    return await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return null;
  }
}

/** Passes an API error (status and JSON body) through unchanged. */
export async function relayError(upstream: Response | null) {
  if (!upstream) {
    return errorResponse(502, "api_unreachable", "API is unreachable");
  }
  const body = await upstream.json().catch(() => null);
  return NextResponse.json(
    body ?? { error: { code: "api_error", message: "API error" } },
    { status: upstream.status, headers: { "Cache-Control": "no-store" } },
  );
}
