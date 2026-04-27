export const ORDER_PRICING = {
  BASE_RATE: 2.0,
  RATE_PER_KM: 0.5,
  HEAVY_THRESHOLD_KG: 15,
  HEAVY_SURCHARGE: 1.5,
  SIZE_MULTIPLIER: {
    SMALL: 1.0,
    MEDIUM: 1.2,
    LARGE: 1.5,
    EXTRA_LARGE: 2.0,
  },
  DRIVER_SHARE: 0.7,
  // weight thresholds used to infer package size when not explicitly provided
  WEIGHT_SIZE_THRESHOLDS: {
    SMALL: 1,    // < 1kg
    MEDIUM: 5,   // 1–5kg
    LARGE: 15,   // 5–15kg
    // > 15kg → EXTRA_LARGE
  },
} as const;
