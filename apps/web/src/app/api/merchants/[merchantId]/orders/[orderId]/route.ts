import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const GET = makeProtectedParamRoute<{
  merchantId: string;
  orderId: string;
}>(({ merchantId, orderId }) => `/merchants/${merchantId}/orders/${orderId}`);
