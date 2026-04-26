import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'driver@imag.fr or +33612345678',
    description: 'Email address or phone number',
  })
  @IsString()
  identifier: string;

  @ApiProperty({ minLength: 8, example: 'Password' })
  @IsString()
  @MinLength(8)
  password: string;
}
