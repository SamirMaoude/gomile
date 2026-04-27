import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class UpdateDriverProfileDto {
  @ApiProperty({
    example: 'https://storage.example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: '+33612345678', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '22 boulevard Clemenceau, 38000 Grenoble',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Grenoble', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '38000', required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'boulevard Clemenceau', required: false })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'Grenoble', required: false })
  @IsString()
  @IsOptional()
  deliveryCity?: string;

  @ApiProperty({ example: 15, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  deliveryRadius?: number;

  @ApiProperty({ enum: VehicleType, required: false })
  @IsEnum(VehicleType)
  @IsOptional()
  transportType?: VehicleType;
}
