import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto {
  @ApiProperty({
    description: 'New name for the API key',
    example: 'Production Key',
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'New expiration date (ISO 8601). Send null to remove expiry.',
    example: '2028-01-01T00:00:00.000Z',
    nullable: true,
    required: false,
  })
  @ValidateIf((o: UpdateApiKeyDto) => o.expiresAt !== null)
  @IsDateString()
  @IsOptional()
  expiresAt?: string | null;
}
