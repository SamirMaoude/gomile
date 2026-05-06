import { NextRequest, NextResponse } from "next/server";
import type { AuthTokensResponse } from "../../../../shared/auth-contracts";
import { authCookies, clearAuthCookies, setAuthCookies } from "@/lib/bff/auth-cookies";
import { getCookieValues } from "@/lib/bff/cookie-utils";
import {
  buildBackendUrl,
  buildForwardHeaders,
  buildMissingAuthTokenResponse,
  buildProxyResponse,
  readRequestBody,
} from "@/lib/bff/proxy-core";

async function refreshAccessToken(request: NextRequest) {
  const refreshTokens = getCookieValues(request, authCookies.refreshToken);

  if (refreshTokens.length === 0) {
    return null;
  }

  for (const refreshToken of refreshTokens) {
    const refreshResponse = await fetch(buildBackendUrl(request, "/auth/refresh"), {
      method: "POST",
      headers: buildForwardHeaders(request, `Bearer ${refreshToken}`),
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      return (await refreshResponse.json()) as AuthTokensResponse;
    }
  }

  return null;
}

async function fetchProtectedBackend(
  request: NextRequest,
  backendPath: string,
  accessToken: string,
  body?: ArrayBuffer,
) {
  return fetch(buildBackendUrl(request, backendPath), {
    method: request.method,
    headers: buildForwardHeaders(request, `Bearer ${accessToken}`),
    body,
    cache: "no-store",
  });
}

export async function proxyApiRequest(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;
  const body = await readRequestBody(request);

  if (!accessToken) {
    const refreshedTokens = await refreshAccessToken(request);

    if (!refreshedTokens) {
      return buildMissingAuthTokenResponse();
    }

    const backendResponse = await fetchProtectedBackend(
      request,
      backendPath,
      refreshedTokens.accessToken,
      body,
    );
    const response = await buildProxyResponse(backendResponse);
    setAuthCookies(response, refreshedTokens);
    return response;
  }

  const backendResponse = await fetchProtectedBackend(
    request,
    backendPath,
    accessToken,
    body,
  );

  if (backendResponse.status !== 401) {
    return buildProxyResponse(backendResponse);
  }

  const refreshedTokens = await refreshAccessToken(request);

  if (!refreshedTokens) {
    const response = await buildProxyResponse(backendResponse);
    clearAuthCookies(response);
    return response;
  }

  const retryResponse = await fetchProtectedBackend(
    request,
    backendPath,
    refreshedTokens.accessToken,
    body,
  );
  const response = await buildProxyResponse(retryResponse);
  setAuthCookies(response, refreshedTokens);
  return response;
}
