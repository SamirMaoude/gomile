import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const POST = makeProtectedParamRoute<{ orderId: string }>(
  ({ orderId }) => `/admin/orders/${orderId}/reset`,
);
