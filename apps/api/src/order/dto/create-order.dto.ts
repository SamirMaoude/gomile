import { ApiProperty } from '@nestjs/swagger';
import {
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { OrderType, PackageSize } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer name', example: 'Jean Dupont' })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+33612345678',
  })
  @IsPhoneNumber()
  customerPhone: string;

  @ApiProperty({
    description: 'Customer dropoff address',
    example: '22 boulevard Clemenceau, 38000 Grenoble',
  })
  @IsString()
  dropOffAddress: string;

  @ApiProperty({
    description: 'Order type',
    enum: OrderType,
    example: OrderType.FOOD,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'Package size',
    enum: PackageSize,
    example: PackageSize.MEDIUM,
    required: false,
    default: PackageSize.MEDIUM,
  })
  @IsEnum(PackageSize)
  @IsOptional()
  packageSize?: PackageSize;

  @ApiProperty({
    description: 'Package weight in kg',
    example: 3.5,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'External order reference',
    example: '21042',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderReference?: string;
}
