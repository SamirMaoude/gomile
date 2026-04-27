import { NextRequest, NextResponse } from "next/server";
import type { AuthTokensResponse } from "../../../../shared/auth-contracts";
import { AUTH_MESSAGES } from "../../../../shared/auth-messages";
import { clearAuthCookies, setAuthCookies, authCookies } from "@/lib/bff/auth-cookies";
import {
  buildBackendUnreachableResponse,
  buildMissingAuthTokenResponse,
  buildProxyResponse,
  fetchBackendResponse,
} from "@/lib/bff/proxy-core";

async function buildAuthSuccessResponse(backendResponse: Response) {
  const payload = (await backendResponse.json()) as AuthTokensResponse;
  const response = NextResponse.json(
    {
      user: payload.user,
    },
    { status: backendResponse.status },
  );

  setAuthCookies(response, payload);
  return response;
}

export async function proxySessionCreation(
  request: NextRequest,
  backendPath: string,
) {
  try {
    const backendResponse = await fetchBackendResponse(request, backendPath);

    if (!backendResponse.ok) {
      return buildProxyResponse(backendResponse);
    }

    return buildAuthSuccessResponse(backendResponse);
  } catch {
    return buildBackendUnreachableResponse();
  }
}

export async function proxySessionRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get(authCookies.refreshToken)?.value;

  if (!refreshToken) {
    const response = buildMissingAuthTokenResponse("refresh");
    clearAuthCookies(response);
    return response;
  }

  try {
    const backendResponse = await fetchBackendResponse(
      request,
      "/auth/refresh",
      `Bearer ${refreshToken}`,
    );

    if (!backendResponse.ok) {
      const response = await buildProxyResponse(backendResponse);
      clearAuthCookies(response);
      return response;
    }

    return buildAuthSuccessResponse(backendResponse);
  } catch {
    return buildBackendUnreachableResponse();
  }
}

export async function proxySessionLogout(request: NextRequest) {
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;

  if (!accessToken) {
    const response = NextResponse.json(
      { message: AUTH_MESSAGES.ALREADY_LOGGED_OUT },
      { status: 200 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const backendResponse = await fetchBackendResponse(
      request,
      "/auth/logout",
      `Bearer ${accessToken}`,
    );
    const response = backendResponse.ok
      ? NextResponse.json(await backendResponse.json(), {
          status: backendResponse.status,
        })
      : await buildProxyResponse(backendResponse);

    clearAuthCookies(response);
    return response;
  } catch {
    const response = buildBackendUnreachableResponse();
    clearAuthCookies(response);
    return response;
  }
}
