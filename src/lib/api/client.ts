import { localizedMessage } from "@/lib/api/errors";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly isNetwork: boolean;

  constructor(status: number, code: string, isNetwork = false) {
    super(localizedMessage(code));
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.isNetwork = isNetwork;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
};

type SessionPayload = { accessToken: string; expiresIn: number; user: SessionUser };

// The access token lives in memory only. The refresh token is an httpOnly
// cookie managed by /api/session/*, so scripts never see it.
let accessToken: string | null = null;
let expiresAt = 0;
let inflightRefresh: Promise<SessionPayload | null> | null = null;

function remember(payload: SessionPayload) {
  accessToken = payload.accessToken;
  expiresAt = Date.now() + Math.max(0, payload.expiresIn - 30) * 1000;
}

function forget() {
  accessToken = null;
  expiresAt = 0;
}

async function toApiError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: { code?: string; message?: string };
  } | null;
  return new ApiError(response.status, body?.error?.code ?? "api_error");
}

async function send(input: string, init: RequestInit) {
  try {
    return await fetch(input, { credentials: "same-origin", ...init });
  } catch {
    throw new ApiError(0, "network_error", true);
  }
}

async function postJson(path: string, body?: unknown, headers: Record<string, string> = {}) {
  return send(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Single-flight, and serialized across tabs so a rotated cookie is never replayed. */
export function refreshSession(): Promise<SessionPayload | null> {
  inflightRefresh ??= (async () => {
    const run = async () => {
      const response = await postJson("/api/session/refresh");
      if (response.status === 401) {
        forget();
        return null;
      }
      if (!response.ok) throw await toApiError(response);
      const payload = (await response.json()) as SessionPayload;
      remember(payload);
      return payload;
    };
    return navigator.locks ? navigator.locks.request("minima-session-refresh", run) : run();
  })().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}

async function validAccessToken() {
  if (accessToken && Date.now() < expiresAt) return accessToken;
  const session = await refreshSession();
  if (!session) throw new ApiError(401, "no_session");
  return session.accessToken;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; raw?: Blob } = {},
  retried = false,
): Promise<T> {
  const token = await validAccessToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  let body: BodyInit | undefined;
  if (options.raw) {
    headers["Content-Type"] = options.raw.type;
    body = options.raw;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await send(`/v1${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (response.status === 401 && !retried) {
    forget();
    return apiRequest<T>(path, options, true);
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function publicRequest(path: string, body: unknown) {
  const response = await postJson(`/v1${path}`, body);
  if (!response.ok) throw await toApiError(response);
}

export async function login(email: string, password: string) {
  const response = await postJson("/api/session/login", { email, password });
  if (!response.ok) throw await toApiError(response);
  const payload = (await response.json()) as SessionPayload;
  remember(payload);
  return payload.user;
}

export async function logout() {
  forget();
  await postJson("/api/session/logout").catch(() => undefined);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const token = await validAccessToken();
  const response = await postJson(
    "/api/session/change-password",
    { currentPassword, newPassword },
    { Authorization: `Bearer ${token}` },
  );
  if (!response.ok) throw await toApiError(response);
  remember((await response.json()) as SessionPayload);
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  await publicRequest("/auth/signup", {
    ...input,
    locale: "az",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    client: "web",
  });
}

export const forgotPassword = (email: string) =>
  publicRequest("/auth/forgot-password", { email, client: "web" });

export const resendVerification = (email: string) =>
  publicRequest("/auth/resend-verification", { email, client: "web" });

export const resetPassword = (token: string, password: string) =>
  publicRequest("/auth/reset-password", { token, password });
