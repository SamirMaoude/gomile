import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMerchantDto {
  @ApiPropertyOptional({ example: 'GoMile Grenoble' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsString()
  @IsOptional()
  phone?: string;
}
