import { makeSessionCreationRoute } from "@/lib/bff/route-factories";

export const POST = makeSessionCreationRoute("/auth/login");
