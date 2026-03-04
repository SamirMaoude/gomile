import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDriverDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;
}
