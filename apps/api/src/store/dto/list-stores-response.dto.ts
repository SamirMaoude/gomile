import { ApiProperty } from '@nestjs/swagger';
import { StoreProvider } from '@prisma/client';

class StoreOrderCountDto {
  @ApiProperty({
    example: 42,
    description: 'Total number of orders placed at this store',
  })
  orders: number;
}

export class ListStoresResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({ example: "Riku's pet shop" })
  name: string;

  @ApiProperty({ nullable: true, example: 'Best pet shop in Grenoble' })
  description: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether the store is currently accepting orders',
  })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Locked by system due to subscription downgrade' })
  isLocked: boolean;

  @ApiProperty({ example: '25 boulevard Clemenceau, 38100 Grenoble' })
  address: string;

  @ApiProperty({ example: 45.188529 })
  latitude: number;

  @ApiProperty({ example: 5.724524 })
  longitude: number;

  @ApiProperty({ enum: StoreProvider, nullable: true, example: null })
  provider: StoreProvider | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: () => StoreOrderCountDto, description: 'Order counts' })
  _count: StoreOrderCountDto;
}
