import { ApiProperty } from '@nestjs/swagger';
import { StoreProvider } from '@prisma/client';

export class GetStoreResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  merchantId: string;

  @ApiProperty({ example: "Riku's pet shop" })
  name: string;

  @ApiProperty({ nullable: true, example: 'Best pet shop in Grenoble' })
  description: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Locked by system due to subscription downgrade' })
  isLocked: boolean;

  @ApiProperty({ example: '25 boulevard Clemenceau, 38100 Grenoble' })
  address: string;

  @ApiProperty({ example: 45.188529 })
  latitude: number;

  @ApiProperty({ example: 5.724524 })
  longitude: number;

  @ApiProperty({ nullable: true, example: 'myshop.com' })
  domain: string | null;

  @ApiProperty({ enum: StoreProvider, nullable: true, example: null })
  provider: StoreProvider | null;

  @ApiProperty({
    nullable: true,
    example: 'https://myshop.com/webhooks/gomile',
  })
  webhookUrl: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
