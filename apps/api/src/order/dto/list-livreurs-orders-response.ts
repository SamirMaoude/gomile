import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class ListDriverOrdersResponseDto {
  @ApiProperty({
    description: 'Order ID',
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({
    description: 'Store ID where the order must be picked up',
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  storeId: string;

  @ApiProperty({
    description: 'Merchant ID who created the order',
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  merchantId: string;

  @ApiProperty({ description: "Customer's full name", example: 'Dang Khoa' })
  customerName: string;

  @ApiProperty({
    description: 'Delivery address',
    example: '25 boulevard Clemenceau, 38100 Grenoble',
  })
  dropOffAddress: string;

  @ApiProperty({
    description: 'Current order status',
    enum: OrderStatus,
    example: OrderStatus.DRIVER_ACCEPTED,
  })
  status: OrderStatus;

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
}
