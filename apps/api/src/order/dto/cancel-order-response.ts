import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderResponseDto {
  @ApiProperty({ description: 'Cancel message', type: 'string' })
  message: string;
}
