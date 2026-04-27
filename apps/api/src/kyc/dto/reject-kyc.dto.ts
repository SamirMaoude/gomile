import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectKycDto {
  @ApiProperty({ example: 'Document expired or Document is unreadable' })
  @IsString()
  @MinLength(3)
  rejectionReason: string;
}
