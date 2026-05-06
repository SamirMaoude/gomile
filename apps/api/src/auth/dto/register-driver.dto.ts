import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsPhoneNumber,
  IsUrl,
} from 'class-validator';
import { Gender, VehicleType } from '@prisma/client';

export class RegisterDriverDto {
  @ApiProperty({ example: 'driver@test.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Riku' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Loulou' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+33612345678' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '1998-05-12' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  avatarUrl: string;

  // Address
  @ApiProperty({ example: '22 boulevard Clemenceau, 38000 Grenoble' })
  @IsString()
  address: string;

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

  // Delivery
  @ApiProperty({ example: 'Grenoble' })
  @IsString()
  deliveryCity: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  deliveryRadius: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.BIKE })
  @IsEnum(VehicleType)
  transportType: VehicleType;

  // Documents (URLs — files must be uploaded first)
  @ApiProperty({
    example: 'https://storage.example.com/cni.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  cniFile?: string;

  @ApiProperty({
    example: 'https://storage.example.com/justif.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  justificatifFile?: string;

  @ApiProperty({
    example: 'https://storage.example.com/permis.jpg',
    required: false,
    description: 'Required if transportType is not BIKE',
  })
  @IsUrl()
  @IsOptional()
  permisFile?: string;

  @ApiProperty({
    example: 'https://storage.example.com/cartegrise.jpg',
    required: false,
    description: 'Required if transportType is not BIKE',
  })
  @IsUrl()
  @IsOptional()
  carteGriseFile?: string;

  // Pro info
  @ApiProperty({ example: '12345678900012', required: false })
  @IsString()
  @IsOptional()
  siret?: string;

  @ApiProperty({
    example: 'https://storage.example.com/kbis.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  kbisFile?: string;

  @ApiProperty({
    example: 'https://storage.example.com/rib.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  ribFile?: string;
}
