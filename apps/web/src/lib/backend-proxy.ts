import { NextRequest } from "next/server";
import { authCookies } from "@/lib/bff/auth-cookies";
import {
  buildMissingAuthTokenResponse,
  proxyToBackend,
} from "@/lib/bff/proxy-core";

export async function forwardRequest(request: NextRequest, backendPath: string) {
  return proxyToBackend(request, backendPath, request.headers.get("authorization") ?? undefined);
}


export async function forwardAuthenticatedRequest(
    request: NextRequest,
    backendPath: string,
) {
  // reads cookie from incoming request
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;

  // if nothing, stop
  if (!accessToken) {
    return buildMissingAuthTokenResponse();
  }

  return proxyToBackend(request, backendPath, `Bearer ${accessToken}`);
}
