import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DeliveryEstimateDto } from './dto/delivery-estimate.dto';
import { DeliveryPricingService } from './delivery-pricing.service';
import { OpenRouteService } from './openrouteservice.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiTags('[Plugin]')
@Controller()
export class DeliveryPricingController {
  constructor(
    private readonly openRouteService: OpenRouteService,
    private readonly deliveryPricingService: DeliveryPricingService,
  ) {}

  @ApiOperation({ summary: 'Estimate delivery cost and driver reward' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key for authentication',
    required: true,
  })
  @ApiOkResponse({ description: 'Delivery estimate calculated successfully' })
  @UseGuards(ApiKeyGuard)
  @Post('delivery-estimates')
  async estimate(@Body() dto: DeliveryEstimateDto) {
    const pickup = await this.openRouteService.resolveAddress(
      dto.pickupAddress,
    );
    const dropoff = await this.openRouteService.resolveAddress(
      dto.dropoffAddress,
    );
    const route = await this.openRouteService.getDrivingRoute(pickup, dropoff);

    const estimation = this.deliveryPricingService.calculate({
      distanceMeters: route.distanceMeters,
      weightKg: dto.weightKg,
      packageSize: dto.packageSize,
    });
    return {
      deliveryFee: estimation.deliveryFee,
      estimation: estimation.distanceKm,
    };
  }
}
