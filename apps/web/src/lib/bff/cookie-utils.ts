import type { NextRequest } from "next/server";

export function getCookieValues(
  request: NextRequest,
  cookieName: string,
): string[] {
  const header = request.headers.get("cookie");

  if (!header) {
    return [];
  }

  return header
    .split(/;\s*/)
    .map((entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex <= 0) {
        return null;
      }

      const name = entry.slice(0, separatorIndex);
      const value = entry.slice(separatorIndex + 1);

      return name === cookieName ? value : null;
    })
    .filter((value): value is string => Boolean(value));
}
