import { ApiProperty } from '@nestjs/swagger';

export class PresignResponseDto {
  @ApiProperty({ description: 'PUT the file bytes to this URL. Expires in 5 minutes.' })
  uploadUrl: string;

  @ApiProperty({ description: 'Permanent key URL — store this in the DB and pass it back on register/document endpoints.' })
  fileUrl: string;

  @ApiProperty({ description: 'Pre-signed GET URL for immediate preview. Expires in 1 hour.' })
  viewUrl: string;
}
