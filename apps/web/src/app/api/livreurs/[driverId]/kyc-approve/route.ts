import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

type Params = { params: Promise<{ driverId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { driverId } = await params;
  return proxyApiRequest(request, `/admin/drivers/${driverId}/kyc/approve`);
}
