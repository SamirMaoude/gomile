import { Injectable } from '@nestjs/common';
import { PackageSize } from '@prisma/client';
import { ORDER_PRICING } from '../order/order-pricing.config';

type PricingInput = {
  distanceMeters: number;
  weightKg?: number;
  packageSize?: PackageSize;
};

type PricingResult = {
  deliveryFee: number;
  reward: number;
  distanceKm: number;
};

@Injectable()
export class DeliveryPricingService {
  calculate(input: PricingInput): PricingResult {
    // Price formula :
    // (base_rate + distance * price_per_km) * (weight_multiplier) + surcharge_cost
    // weight_multiplier and surcharge_cost base on order weight
    const distanceKm = input.distanceMeters / 1000;
    const multiplier =
      ORDER_PRICING.SIZE_MULTIPLIER[input.packageSize ?? PackageSize.MEDIUM];
    const heavySurcharge =
      (input.weightKg ?? 0) > ORDER_PRICING.HEAVY_THRESHOLD_KG
        ? ORDER_PRICING.HEAVY_SURCHARGE
        : 0;

    const deliveryFee = parseFloat(
      (
        (ORDER_PRICING.BASE_RATE + distanceKm * ORDER_PRICING.RATE_PER_KM) *
          multiplier +
        heavySurcharge
      ).toFixed(2),
    );
    const reward = parseFloat(
      (deliveryFee * ORDER_PRICING.DRIVER_SHARE).toFixed(2),
    );

    return {
      deliveryFee,
      reward,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
    };
  }
}
