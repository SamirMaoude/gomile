import { ApiProperty } from '@nestjs/swagger';
import { StoreProvider } from '@prisma/client';

class ApiKeyStoreDto {
  @ApiProperty({ example: 'Magasin de Ousmanne' })
  name: string;

  @ApiProperty({ nullable: true, example: 'myshop.com' })
  domain: string | null;

  @ApiProperty({ enum: StoreProvider, nullable: true, example: null })
  provider: StoreProvider | null;
}

export class GetApiKeyResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({ example: 'Magasin de Ousmanne' })
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
    description: 'Set when the key has been revoked',
  })
  revokedAt: Date | null;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
    description: 'Expiration date, null means no expiration',
  })
  expiresAt: Date | null;

  @ApiProperty({
    type: () => ApiKeyStoreDto,
    description: 'Store this API key is scoped to',
  })
  store: ApiKeyStoreDto;
}
