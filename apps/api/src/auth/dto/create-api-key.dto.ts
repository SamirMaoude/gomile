import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Name of the API key',
    example: 'Magasin de Ousmanne',
    type: 'string',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID of the store',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
  })
  @IsUUID()
  storeId: string;

  @ApiProperty({
    description: 'Expiration date of the API key',
    example: '2027-01-01T00:00:00.000Z',
    type: 'string',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
