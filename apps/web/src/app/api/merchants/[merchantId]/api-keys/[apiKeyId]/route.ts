import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

const apiKeyRoute = makeProtectedParamRoute<{
  merchantId: string;
  apiKeyId: string;
}>(({ merchantId, apiKeyId }) => `/merchants/${merchantId}/api-keys/${apiKeyId}`);

export const GET = apiKeyRoute;
export const PATCH = apiKeyRoute;
