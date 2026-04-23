import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { PackageSize } from '@prisma/client';
import { AddressInputDto } from './address-input.dto';

export class DeliveryEstimateDto {
  @ApiProperty({ type: AddressInputDto })
  @ValidateNested()
  @Type(() => AddressInputDto)
  pickupAddress: AddressInputDto;

  @ApiProperty({ type: AddressInputDto })
  @ValidateNested()
  @Type(() => AddressInputDto)
  dropoffAddress: AddressInputDto;

  @ApiProperty({
    description: 'Package weight in kg',
    example: 3.5,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  weightKg?: number;

  @ApiProperty({
    enum: PackageSize,
    required: false,
    default: PackageSize.MEDIUM,
  })
  @IsEnum(PackageSize)
  @IsOptional()
  packageSize?: PackageSize;
}
