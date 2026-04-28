import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class StartDriverRegistrationDto {
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

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
