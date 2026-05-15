import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const GET = makeProtectedParamRoute<{ merchantId: string }>(
  ({ merchantId }) => `/admin/merchants/${merchantId}`,
);
