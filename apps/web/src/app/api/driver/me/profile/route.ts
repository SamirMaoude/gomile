import { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

export async function PATCH(request: NextRequest) {
  return proxyApiRequest(request, "/driver/me/profile");
}
