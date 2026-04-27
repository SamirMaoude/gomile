import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const POST = makeProtectedParamRoute<{
  merchantId: string;
  apiKeyId: string;
}>(({ merchantId, apiKeyId }) => `/merchants/${merchantId}/api-keys/${apiKeyId}/revoke`);
