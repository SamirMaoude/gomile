import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsEnum, IsUrl } from 'class-validator';

export class CreateDriverDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    description: 'Type of document being uploaded',
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({
    description: 'S3 URL of the uploaded file',
    example: 'https://bucket.s3.region.amazonaws.com/uploads/uuid.pdf',
  })
  @IsUrl()
  url: string;
}
