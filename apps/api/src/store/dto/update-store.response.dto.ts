import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreResponseDto {
  @ApiProperty({ description: 'Name of the store', type: 'string' })
  name: string;

  @ApiProperty({ description: 'ID of the store', type: 'string' })
  id: string;

  @ApiProperty({ description: 'Message', type: 'string' })
  message: string;
}
