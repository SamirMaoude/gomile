import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

type Params = { params: Promise<{ merchantId: string; storeId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { merchantId, storeId } = await params;
  return proxyApiRequest(request, `/merchants/${merchantId}/stores/${storeId}/orders/handshake/verify`);
}
