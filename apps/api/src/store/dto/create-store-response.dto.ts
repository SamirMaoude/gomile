import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreResponseDto {
  @ApiProperty({
    description: 'Name of the store created',
    type: 'string',
    example: 'M&M Grenoble',
  })
  name: string;

  @ApiProperty({
    description: 'ID of the store',
    type: 'string',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;
}
