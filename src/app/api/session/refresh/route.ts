import { cookies } from "next/headers";

import {
  callApi,
  clearSession,
  errorResponse,
  isSameOrigin,
  relayError,
  sessionCookie,
  sessionResponse,
  type SessionPayload,
} from "@/lib/server/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden", "Forbidden");

  const refreshToken = (await cookies()).get(sessionCookie)?.value;
  if (!refreshToken) return errorResponse(401, "no_session", "Not signed in");

  const upstream = await callApi(request, "/v1/auth/refresh", {
    body: { refreshToken },
  });
  if (!upstream?.ok) {
    const response = await relayError(upstream);
    return upstream && upstream.status < 500 ? clearSession(response) : response;
  }

  return sessionResponse((await upstream.json()) as SessionPayload);
}
