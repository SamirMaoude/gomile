import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryPricingService } from 'src/delivery/delivery-pricing.service';
import { PackageSize } from '@prisma/client';

describe('DeliveryPricingService', () => {
  let service: DeliveryPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryPricingService],
    }).compile();

    service = module.get(DeliveryPricingService);
  });

  describe('calculate', () => {
    it('computes fee for a small package over 5 km', () => {
      const result = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.SMALL });
      // (2.0 + 5 * 0.5) * 1.0 = 4.5
      expect(result.deliveryFee).toBe(4.5);
      expect(result.distanceKm).toBe(5);
      expect(result.reward).toBeCloseTo(4.5 * 0.7, 2);
    });

    it('applies MEDIUM multiplier (1.2) for medium package', () => {
      const result = service.calculate({ distanceMeters: 10000, packageSize: PackageSize.MEDIUM });
      // (2.0 + 10 * 0.5) * 1.2 = 8.4
      expect(result.deliveryFee).toBe(8.4);
    });

    it('applies LARGE multiplier (1.5) for large package', () => {
      const result = service.calculate({ distanceMeters: 4000, packageSize: PackageSize.LARGE });
      // (2.0 + 4 * 0.5) * 1.5 = 6.0
      expect(result.deliveryFee).toBe(6.0);
    });

    it('applies EXTRA_LARGE multiplier (2.0) for extra large package', () => {
      const result = service.calculate({ distanceMeters: 2000, packageSize: PackageSize.EXTRA_LARGE });
      // (2.0 + 2 * 0.5) * 2.0 = 6.0
      expect(result.deliveryFee).toBe(6.0);
    });

    it('applies heavy surcharge when weight exceeds 15 kg', () => {
      const without = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.SMALL });
      const withHeavy = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.SMALL, weightKg: 20 });
      expect(withHeavy.deliveryFee).toBeCloseTo(without.deliveryFee + 1.5, 2);
    });

    it('does not apply heavy surcharge at exactly 15 kg', () => {
      const result = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.SMALL, weightKg: 15 });
      // (2.0 + 5 * 0.5) * 1.0 + 0 = 4.5
      expect(result.deliveryFee).toBe(4.5);
    });

    it('infers SMALL size when weight < 1 kg and no packageSize given', () => {
      const inferred = service.calculate({ distanceMeters: 5000, weightKg: 0.5 });
      const explicit = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.SMALL });
      expect(inferred.deliveryFee).toBe(explicit.deliveryFee);
    });

    it('infers MEDIUM size when weight is between 1 and 5 kg', () => {
      const inferred = service.calculate({ distanceMeters: 5000, weightKg: 3 });
      const explicit = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.MEDIUM });
      expect(inferred.deliveryFee).toBe(explicit.deliveryFee);
    });

    it('infers LARGE size when weight is between 5 and 15 kg', () => {
      const inferred = service.calculate({ distanceMeters: 5000, weightKg: 10 });
      const explicit = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.LARGE });
      expect(inferred.deliveryFee).toBe(explicit.deliveryFee);
    });

    it('infers EXTRA_LARGE size when weight > 15 kg', () => {
      const inferred = service.calculate({ distanceMeters: 5000, weightKg: 20 });
      const explicit = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.EXTRA_LARGE, weightKg: 20 });
      expect(inferred.deliveryFee).toBe(explicit.deliveryFee);
    });

    it('driver receives 70% of delivery fee', () => {
      const result = service.calculate({ distanceMeters: 10000, packageSize: PackageSize.MEDIUM });
      expect(result.reward).toBeCloseTo(result.deliveryFee * 0.7, 2);
    });

    it('returns distanceKm rounded to 2 decimals', () => {
      const result = service.calculate({ distanceMeters: 3333, packageSize: PackageSize.SMALL });
      expect(result.distanceKm).toBe(3.33);
    });

    it('uses MEDIUM as default when no weight or packageSize given', () => {
      const result = service.calculate({ distanceMeters: 5000 });
      const explicit = service.calculate({ distanceMeters: 5000, packageSize: PackageSize.MEDIUM });
      expect(result.deliveryFee).toBe(explicit.deliveryFee);
    });
  });
});
