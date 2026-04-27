import { ApiProperty } from '@nestjs/swagger';

export class DeleteStoreResponseDto {
  @ApiProperty({ description: 'Message', type: 'string' })
  message: string;
}
