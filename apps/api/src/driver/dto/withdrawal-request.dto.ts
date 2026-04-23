import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class WithdrawalRequestDto {
  @ApiProperty({ description: 'Amount to withdraw in EUR', example: 50.0 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
