import {
  callApi,
  errorResponse,
  isSameOrigin,
  relayError,
  sessionResponse,
  type SessionPayload,
} from "@/lib/server/session";

/** Changing the password issues a new session; keep its refresh token in the cookie. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden", "Forbidden");

  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return errorResponse(401, "invalid_token", "Missing access token");

  const body = await request.json().catch(() => null);
  const upstream = await callApi(request, "/v1/auth/change-password", { body, token });
  if (!upstream?.ok) return relayError(upstream);

  return sessionResponse((await upstream.json()) as SessionPayload);
}
