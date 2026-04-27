import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

const storesRoute = makeProtectedParamRoute<{ merchantId: string }>(
  ({ merchantId }) => `/merchants/${merchantId}/stores`,
);

export const GET = storesRoute;
export const POST = storesRoute;
