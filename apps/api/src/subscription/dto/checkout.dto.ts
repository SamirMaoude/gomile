import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ enum: ['PRO', 'BUSINESS'], example: 'PRO' })
  @IsEnum(['PRO', 'BUSINESS'])
  plan: 'PRO' | 'BUSINESS';
}
