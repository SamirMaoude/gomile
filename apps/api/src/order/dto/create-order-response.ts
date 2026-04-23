import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderResponseDto {
  @ApiProperty({ description: 'Order ID', type: 'string' })
  orderId: string;

  @ApiProperty({
    description: 'Delivery code to communicate to the customer',
    type: 'string',
  })
  deliveryCode: string;

  @ApiProperty({
    description: 'Delivery fee charged to the merchant in EUR',
    type: 'number',
  })
  deliveryFee: number;

  @ApiProperty({
    description: 'Distance between store and dropoff in km',
    type: 'number',
  })
  distanceKm: number;

  @ApiProperty({ description: 'Message', type: 'string' })
  message: string;
}
