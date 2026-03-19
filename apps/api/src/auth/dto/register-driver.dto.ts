import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsString, MinLength, IsDateString, IsEnum, IsOptional} from 'class-validator';
import { Gender } from '@prisma/client';
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

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'Loulou' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ezesfasfdf'})
  @IsString()
  avatarUrl: string;

  @ApiProperty({ example: '0612345678' })
  @IsString()
  phone: string;

  @ApiProperty({example: 'ThisIsAnUrl', required: false})
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiProperty({ example: '2026-01-02' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: '22 boulevard Clemenceau, 38100, Grenoble'})
  @IsString()
  address: string;

}
