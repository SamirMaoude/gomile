import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class HandshakeDto {
  @ApiProperty({ description: 'A 6 digit OTP code', example: '023106' })
  @IsString()
  code: string;
}
