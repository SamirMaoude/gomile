import { makeProtectedRoute } from "@/lib/bff/route-factories";

const kycRoute = makeProtectedRoute("/driver/me/kyc");

export const GET = kycRoute;
export const POST = kycRoute;
