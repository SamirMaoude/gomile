import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, KycStatus } from '@prisma/client';

class KycDocumentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty({
    example: 'https://bucket.s3.region.amazonaws.com/uploads/uuid.pdf',
  })
  url: string;

  @ApiProperty()
  verified: boolean;

  @ApiProperty({ nullable: true, example: null })
  rejectionReason: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;
}

class KycSubmissionSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: KycStatus })
  status: KycStatus;

  @ApiProperty({ nullable: true, example: null })
  rejectionReason: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;
}

export class KycStatusResponseDto {
  @ApiProperty({ enum: KycStatus, example: KycStatus.NOT_SUBMITTED })
  status: KycStatus;

  @ApiProperty({ type: [KycDocumentDto] })
  documents: KycDocumentDto[];

  @ApiProperty({
    type: () => KycSubmissionSummaryDto,
    nullable: true,
    example: null,
  })
  latestSubmission: KycSubmissionSummaryDto | null;
}
