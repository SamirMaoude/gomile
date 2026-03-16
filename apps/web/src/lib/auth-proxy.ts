import { NextRequest, NextResponse } from "next/server";
import { createApiError } from "../../../../shared/api-errors";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const ACCESS_TOKEN_COOKIE = "gomile_access_token";
const REFRESH_TOKEN_COOKIE = "gomile_refresh_token";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

function resolveApiBaseUrl() {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function buildTargetUrl(backendPath: string) {
  return new URL(backendPath, resolveApiBaseUrl()).toString();
}

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function setAuthCookies(
  response: NextResponse,
  tokens: Pick<AuthTokensResponse, "accessToken" | "refreshToken">,
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    buildCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    buildCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...buildCookieOptions(0),
    expires: new Date(0),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...buildCookieOptions(0),
    expires: new Date(0),
  });
}

function buildForwardHeaders(request: NextRequest, authorization?: string) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const xRequestId = request.headers.get("x-request-id");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (xRequestId) {
    headers.set("x-request-id", xRequestId);
  }
  if (authorization) {
    headers.set("authorization", authorization);
  }

  return headers;
}

async function fetchBackend(
  request: NextRequest,
  backendPath: string,
  authorization?: string,
) {
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  return fetch(buildTargetUrl(backendPath), {
    method,
    headers: buildForwardHeaders(request, authorization),
    body,
    cache: "no-store",
  });
}

async function buildErrorResponse(backendResponse: Response) {
  const responseText = await backendResponse.text();
  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  return new NextResponse(responseText || null, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

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

function buildMissingTokenResponse(tokenKind: "access" | "refresh") {
  const error =
    tokenKind === "refresh"
      ? createApiError("AUTH_TOKEN_MISSING")
      : createApiError("AUTH_TOKEN_MISSING");

  return NextResponse.json(
    {
      ...error,
      message: `${error.message}: ${tokenKind}`,
    },
    { status: error.statusCode },
  );
}

export async function proxySessionCreation(
  request: NextRequest,
  backendPath: string,
) {
  try {
    const backendResponse = await fetchBackend(request, backendPath);

    if (!backendResponse.ok) {
      return buildErrorResponse(backendResponse);
    }

    return buildAuthSuccessResponse(backendResponse);
  } catch {
    const error = createApiError("BACKEND_UNREACHABLE");
    return NextResponse.json(
      error,
      { status: error.statusCode },
    );
  }
}

export async function proxySessionRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return buildMissingTokenResponse("refresh");
  }

  try {
    const backendResponse = await fetchBackend(
      request,
      "/auth/refresh",
      `Bearer ${refreshToken}`,
    );

    if (!backendResponse.ok) {
      const response = await buildErrorResponse(backendResponse);
      clearAuthCookies(response);
      return response;
    }

    return buildAuthSuccessResponse(backendResponse);
  } catch {
    const error = createApiError("BACKEND_UNREACHABLE");
    return NextResponse.json(
      error,
      { status: error.statusCode },
    );
  }
}

export async function proxySessionLogout(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    const response = NextResponse.json(
      { message: "Already logged out" },
      { status: 200 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const backendResponse = await fetchBackend(
      request,
      "/auth/logout",
      `Bearer ${accessToken}`,
    );
    const response = backendResponse.ok
      ? NextResponse.json(await backendResponse.json(), {
          status: backendResponse.status,
        })
      : await buildErrorResponse(backendResponse);

    clearAuthCookies(response);
    return response;
  } catch {
    const error = createApiError("BACKEND_UNREACHABLE");
    const response = NextResponse.json(
      error,
      { status: error.statusCode },
    );
    clearAuthCookies(response);
    return response;
  }
}

export const authCookies = {
  accessToken: ACCESS_TOKEN_COOKIE,
  refreshToken: REFRESH_TOKEN_COOKIE,
};
