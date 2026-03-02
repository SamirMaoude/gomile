import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

function resolveApiBaseUrl() {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function buildTargetUrl(request: NextRequest, backendPath: string) {
  const baseUrl = resolveApiBaseUrl();
  const targetUrl = new URL(backendPath, baseUrl);
  const search = request.nextUrl.searchParams.toString();

  if (search) {
    targetUrl.search = search;
  }

  return targetUrl.toString();
}

function forwardableHeaders(request: NextRequest) {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const xRequestId = request.headers.get("x-request-id");

  if (authorization) {
    headers.set("authorization", authorization);
  }
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (xRequestId) {
    headers.set("x-request-id", xRequestId);
  }

  return headers;
}

export async function forwardRequest(request: NextRequest, backendPath: string) {
  const method = request.method;
  const targetUrl = buildTargetUrl(request, backendPath);
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  try {
    const backendResponse = await fetch(targetUrl, {
      method,
      headers: forwardableHeaders(request),
      body,
      cache: "no-store",
    });
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
  } catch {
    return NextResponse.json(
      { error: "BACKEND_UNREACHABLE", message: "Cannot reach backend API" },
      { status: 502 },
    );
  }
}
