import { NextRequest, NextResponse } from "next/server";
import { createApiError } from "../../../../../shared/api-errors";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function resolveApiBaseUrl() {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function buildBackendUrl(request: NextRequest, backendPath: string) {
  const url = new URL(backendPath, resolveApiBaseUrl());

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function buildForwardHeaders(
  request: NextRequest,
  authorization?: string,
) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const xRequestId = request.headers.get("x-request-id");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (xRequestId) {
    headers.set("x-request-id", xRequestId);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  }

  return headers;
}

export async function readRequestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

export async function fetchBackendResponse(
  request: NextRequest,
  backendPath: string,
  authorization?: string,
) {
  return fetch(buildBackendUrl(request, backendPath), {
    method: request.method,
    headers: buildForwardHeaders(request, authorization),
    body: await readRequestBody(request),
    cache: "no-store",
  });
}

export async function buildProxyResponse(backendResponse: Response) {
  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (backendResponse.status === 204) {
    return new NextResponse(null, {
      status: backendResponse.status,
      headers,
    });
  }

  const body = await backendResponse.arrayBuffer();

  return new NextResponse(body, {
    status: backendResponse.status,
    headers,
  });
}

export function buildBackendUnreachableResponse() {
  const error = createApiError("BACKEND_UNREACHABLE");
  return NextResponse.json(error, { status: error.statusCode });
}

export function buildMissingAuthTokenResponse(tokenKind?: "access" | "refresh") {
  const error = createApiError("AUTH_TOKEN_MISSING");

  if (!tokenKind) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  return NextResponse.json(
    {
      ...error,
      message: `${error.message}: ${tokenKind}`,
    },
    { status: error.statusCode },
  );
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  authorization?: string,
) {
  try {
    const backendResponse = await fetchBackendResponse(
      request,
      backendPath,
      authorization,
    );

    return buildProxyResponse(backendResponse);
  } catch {
    return buildBackendUnreachableResponse();
  }
}
