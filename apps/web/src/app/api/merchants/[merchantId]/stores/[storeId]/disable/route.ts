import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const POST = makeProtectedParamRoute<{
  merchantId: string;
  storeId: string;
}>(({ merchantId, storeId }) => `/merchants/${merchantId}/stores/${storeId}/disable`);
