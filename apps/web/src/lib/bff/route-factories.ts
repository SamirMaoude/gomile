import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";
import { proxySessionCreation, proxySessionLogout, proxySessionRefresh } from "@/lib/auth-proxy";
import { forwardRequest } from "@/lib/backend-proxy";

type RouteParams = Record<string, string>;
type RouteContext<T extends RouteParams = RouteParams> = {
  params: Promise<T>;
};

type StaticProxyHandler = (
  request: NextRequest,
  backendPath: string,
) => Promise<Response>;

type ParamPathBuilder<T extends RouteParams> = (params: T) => string;

function makeStaticRoute(
  proxyHandler: StaticProxyHandler,
  backendPath: string,
) {
  return function routeHandler(request: NextRequest) {
    return proxyHandler(request, backendPath);
  };
}

function makeParamRoute<T extends RouteParams>(
  proxyHandler: StaticProxyHandler,
  buildBackendPath: ParamPathBuilder<T>,
) {
  return async function routeHandler(
    request: NextRequest,
    context: RouteContext<T>,
  ) {
    const params = await context.params;
    return proxyHandler(request, buildBackendPath(params));
  };
}

export function makePublicRoute(backendPath: string) {
  return makeStaticRoute(forwardRequest, backendPath);
}

export function makeProtectedRoute(backendPath: string) {
  return makeStaticRoute(proxyApiRequest, backendPath);
}

export function makeProtectedParamRoute<T extends RouteParams>(
  buildBackendPath: ParamPathBuilder<T>,
) {
  return makeParamRoute(proxyApiRequest, buildBackendPath);
}

export function makeSessionCreationRoute(backendPath: string) {
  return makeStaticRoute(proxySessionCreation, backendPath);
}

export function makeSessionRefreshRoute() {
  return function routeHandler(request: NextRequest) {
    return proxySessionRefresh(request);
  };
}

export function makeSessionLogoutRoute() {
  return function routeHandler(request: NextRequest) {
    return proxySessionLogout(request);
  };
}
