import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

const merchantRoute = makeProtectedParamRoute<{ merchantId: string }>(
  ({ merchantId }) => `/merchants/${merchantId}`,
);

export const GET = merchantRoute;
export const PATCH = merchantRoute;
export const DELETE = merchantRoute;
