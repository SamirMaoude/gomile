import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const POST = makeProtectedParamRoute<{
  driverId: string;
  orderId: string;
}>(({ driverId, orderId }) => `/livreurs/${driverId}/orders/${orderId}/pickup`);
