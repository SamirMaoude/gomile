import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { StoreProvider } from '@prisma/client';

export class CreateStoreDto {
  @ApiProperty({
    description: 'The name of the store',
    example: "Riku's pet shop",
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The description of the store',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Address of the store',
    example: '25 boulevard Clémenceau, 38100 Grenoblel',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: "The latitude of the store's location. If omitted, geocoded from address.",
    example: 45.188529,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: "The longitude of the store's location. If omitted, geocoded from address.",
    example: 5.724524,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Domain of the store (for plugin validation)',
    example: 'myshop.com',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateStoreDto) => o.provider !== undefined) // domain and provider must be declared together
  domain?: string;

  @ApiProperty({
    description: 'E-commerce provider',
    enum: StoreProvider,
    required: false,
  })
  @IsEnum(StoreProvider)
  @IsOptional()
  provider?: StoreProvider;

  @ApiProperty({
    description: 'Webhook URL for order status updates',
    example: 'https://myshop.com/webhooks/gomile',
    required: false,
    type: 'string',
  })
  @IsUrl()
  @IsOptional()
  webhookUrl?: string;
}
