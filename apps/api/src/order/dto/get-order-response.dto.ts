import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class GetOrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  orderId: string;

  @ApiProperty({
    description: 'Store ID where the order was placed',
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  storeId: string;

  @ApiProperty({
    description: 'Driver ID assigned to this order',
    format: 'uuid',
    nullable: true,
    example: null,
  })
  driverId: string | null;

  @ApiProperty({ description: "Customer's full name", example: 'Dang Khoa' })
  customerName: string;

  @ApiProperty({
    description: "Customer's phone number",
    example: '+33 633051129',
  })
  customerPhone: string;

  @ApiProperty({
    description: 'Delivery address',
    example: '25 boulevard Clemenceau, 38100 Grenoble',
  })
  dropOffAddress: string;

  @ApiProperty({
    description: 'Order creation date',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date the driver accepted the order',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  acceptedAt: Date | null;

  @ApiProperty({
    description: 'Date the driver picked up the order',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  pickedUpAt: Date | null;

  @ApiProperty({
    description: 'Date the order was delivered',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  deliveredAt: Date | null;

  @ApiProperty({
    description: 'Date the order was cancelled',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  cancelledAt: Date | null;

  @ApiProperty({
    description: 'Current order status',
    enum: OrderStatus,
    example: OrderStatus.SEARCHING_DRIVER,
  })
  status: OrderStatus;
}
