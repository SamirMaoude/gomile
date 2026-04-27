import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({ example: 'Production Key' })
  name: string;

  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  storeId: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  expiresAt: Date | null;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  })
  revokedAt: Date | null;
}
