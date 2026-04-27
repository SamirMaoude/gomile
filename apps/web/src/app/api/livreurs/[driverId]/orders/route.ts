import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const GET = makeProtectedParamRoute<{ driverId: string }>(
  ({ driverId }) => `/livreurs/${driverId}/orders`,
);
