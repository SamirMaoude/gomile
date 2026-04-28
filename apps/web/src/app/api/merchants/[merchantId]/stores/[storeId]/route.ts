import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

const storeRoute = makeProtectedParamRoute<{
  merchantId: string;
  storeId: string;
}>(({ merchantId, storeId }) => `/merchants/${merchantId}/stores/${storeId}`);

export const GET = storeRoute;
export const PATCH = storeRoute;
export const DELETE = storeRoute;
