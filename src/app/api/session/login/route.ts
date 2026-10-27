import {
  callApi,
  errorResponse,
  isSameOrigin,
  relayError,
  sessionResponse,
  type SessionPayload,
} from "@/lib/server/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden", "Forbidden");

  const body = await request.json().catch(() => null);
  const upstream = await callApi(request, "/v1/auth/login", { body });
  if (!upstream?.ok) return relayError(upstream);

  return sessionResponse((await upstream.json()) as SessionPayload);
}
