import { makeProtectedParamRoute } from "@/lib/bff/route-factories";

export const PATCH = makeProtectedParamRoute<{ withdrawalId: string }>(
  ({ withdrawalId }) => `/admin/withdrawals/${withdrawalId}`,
);
