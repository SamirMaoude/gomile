import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const PATCH = makeProtectedParamRoute<{
  merchantId: string;
  storeId: string;
}>(({ merchantId, storeId }) => `/merchants/${merchantId}/stores/${storeId}/webhook`);
