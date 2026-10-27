import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  callApi,
  clearSession,
  errorResponse,
  isSameOrigin,
  sessionCookie,
} from "@/lib/server/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden", "Forbidden");

  const refreshToken = (await cookies()).get(sessionCookie)?.value;
  if (refreshToken) {
    await callApi(request, "/v1/auth/logout", { body: { refreshToken } });
  }
  return clearSession(new NextResponse(null, { status: 204 }));
}
