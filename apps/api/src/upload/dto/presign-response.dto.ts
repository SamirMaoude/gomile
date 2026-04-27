import { ApiProperty } from '@nestjs/swagger';

export class PresignResponseDto {
  @ApiProperty({
    description:
      'Upload URL to put the documents, this URL expires after 5 minutes',
  })
  uploadUrl: string;

  @ApiProperty({
    description:
      'File URL, to be stored both sides. Anyone with this URL can view and download the submitted document',
  })
  fileUrl: string;
}
