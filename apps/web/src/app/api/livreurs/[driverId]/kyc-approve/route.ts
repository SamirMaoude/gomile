import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const PUT = makeProtectedParamRoute<{ driverId: string }>(
  ({ driverId }) => `/admin/drivers/${driverId}/kyc/approve`,
);
