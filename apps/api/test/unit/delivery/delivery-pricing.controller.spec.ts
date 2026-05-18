import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryPricingController } from 'src/delivery/delivery-pricing.controller';
import { DeliveryPricingService } from 'src/delivery/delivery-pricing.service';
import { OpenRouteService } from 'src/delivery/openrouteservice.service';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';

const allowAll = { canActivate: () => true };

const mockOpenRouteService = {
  resolveAddress: jest.fn(),
  getDrivingRoute: jest.fn(),
};

const mockDeliveryPricingService = {
  calculate: jest.fn(),
};

describe('DeliveryPricingController', () => {
  let controller: DeliveryPricingController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryPricingController],
      providers: [
        { provide: OpenRouteService, useValue: mockOpenRouteService },
        { provide: DeliveryPricingService, useValue: mockDeliveryPricingService },
      ],
    })
      .overrideGuard(ApiKeyGuard).useValue(allowAll)
      .compile();
    controller = module.get(DeliveryPricingController);
  });

  it('estimate resolves addresses, gets route, and returns fee', async () => {
    const pickup = { lat: 48.8, lng: 2.3 };
    const dropoff = { lat: 48.9, lng: 2.4 };
    mockOpenRouteService.resolveAddress.mockResolvedValueOnce(pickup).mockResolvedValueOnce(dropoff);
    mockOpenRouteService.getDrivingRoute.mockResolvedValue({ distanceMeters: 5000 });
    mockDeliveryPricingService.calculate.mockReturnValue({ deliveryFee: 3.5, distanceKm: 5 });

    const dto = { pickupAddress: '1 rue A', dropoffAddress: '2 rue B', weightKg: 1, packageSize: 'SMALL' } as any;
    const result = await controller.estimate(dto);

    expect(mockOpenRouteService.resolveAddress).toHaveBeenCalledTimes(2);
    expect(mockOpenRouteService.getDrivingRoute).toHaveBeenCalledWith(pickup, dropoff);
    expect(mockDeliveryPricingService.calculate).toHaveBeenCalledWith({
      distanceMeters: 5000,
      weightKg: 1,
      packageSize: 'SMALL',
    });
    expect(result.deliveryFee).toBe(3.5);
    expect(result.estimation).toBe(5);
  });
});
