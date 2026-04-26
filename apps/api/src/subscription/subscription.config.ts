import { Tier } from "@prisma/client"

export const TIER_LIMITS: Record<Tier, number> = {
  FREE: 1,
  PRO: 5,
  BUSINESS: Infinity
}

export const TIER_PRICING= {
  PRO: 14.90,
  BUSINESS: 59.90
}