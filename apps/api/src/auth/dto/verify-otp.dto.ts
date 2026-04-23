import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: 'meow@example.com'})
  @IsEmail()
  email: string

  @ApiProperty({ example: '013196', description: '6-digit OTP send by email'})
  @IsString()
  otp: string
  
}