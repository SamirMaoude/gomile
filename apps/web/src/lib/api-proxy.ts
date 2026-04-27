import { NextRequest, NextResponse } from "next/server";
import { authCookies } from "@/lib/bff/auth-cookies";
import {
  buildMissingAuthTokenResponse,
  proxyToBackend,
} from "@/lib/bff/proxy-core";

export async function proxyApiRequest(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;

  if (!accessToken) {
    return buildMissingAuthTokenResponse();
  }

  return proxyToBackend(request, backendPath, `Bearer ${accessToken}`);
}
