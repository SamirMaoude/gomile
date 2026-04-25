import { Tier } from "@prisma/client"

export const TIER_LIMITS: Record<Tier, number> = {
  FREE: 1,
  PRO: 5,
  BUSINESS: Infinity
}