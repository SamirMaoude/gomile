import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'woofwoof@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'a3f2...',
    description: 'Reset token returned by verify-otp',
  })
  @IsString()
  resetToken: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
