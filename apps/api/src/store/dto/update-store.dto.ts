import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  ValidateIf,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StoreProvider } from '@prisma/client';

export class UpdateStoreDto {
  @ApiProperty({
    description: 'The name of the store',
    example: "Riku's pet shop",
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

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
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: "The latitude of the store's location",
    example: 45.188529,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o: UpdateStoreDto) => o.longitude !== undefined)
  latitude?: number;

  @ApiProperty({
    description: "The longitude of the store's location",
    example: 5.724524,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o: UpdateStoreDto) => o.latitude !== undefined)
  longitude?: number;

  @ApiProperty({
    description: 'Domain of the store (for plugin validation)',
    example: 'mylittleshop.com',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o: UpdateStoreDto) => o.provider !== undefined)
  domain?: string;

  @ApiProperty({
    description: 'E-commerce provider',
    enum: StoreProvider,
    required: false,
  })
  @IsEnum(StoreProvider)
  @IsOptional()
  provider?: StoreProvider;

}
