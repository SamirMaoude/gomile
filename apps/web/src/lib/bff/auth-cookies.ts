import { NextResponse } from "next/server";
import type { AuthTokensResponse } from "../../../../../shared/auth-contracts";

const ACCESS_TOKEN_COOKIE = "gomile_access_token";
const REFRESH_TOKEN_COOKIE = "gomile_refresh_token";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_PATH = "/";
const REFRESH_TOKEN_PATH = "/api/auth/refresh";

function buildCookieOptions(maxAge: number, path: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge,
  };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: Pick<AuthTokensResponse, "accessToken" | "refreshToken">,
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    buildCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS, ACCESS_TOKEN_PATH),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    buildCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS, REFRESH_TOKEN_PATH),
  );
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...buildCookieOptions(0, ACCESS_TOKEN_PATH),
    expires: new Date(0),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...buildCookieOptions(0, REFRESH_TOKEN_PATH),
    expires: new Date(0),
  });
}

export const authCookies = {
  accessToken: ACCESS_TOKEN_COOKIE,
  refreshToken: REFRESH_TOKEN_COOKIE,
};
