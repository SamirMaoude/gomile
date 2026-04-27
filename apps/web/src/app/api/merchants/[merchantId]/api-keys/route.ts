import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

const apiKeysRoute = makeProtectedParamRoute<{ merchantId: string }>(
  ({ merchantId }) => `/merchants/${merchantId}/api-keys`,
);

export const GET = apiKeysRoute;
export const POST = apiKeysRoute;
