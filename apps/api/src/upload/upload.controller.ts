import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignRequestDto } from './dto/presign-request.dto';
import { UploadService } from './upload.service';
import { PresignResponseDto } from './dto/presign-response.dto';

@ApiTags('[Uploads]')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({
    summary: 'Get a pre-signed S3 upload URL',
    description:
      'Returns a short-lived signed URL. Client must PUT the file directly to uploadUrl within 5 minutes. The fileUrl is the permanent S3 URL to store in the database.',
  })
  @ApiOkResponse({
    description: 'Pre-signed URL generated',
    schema: {
      properties: {
        uploadUrl: {
          type: 'string',
          description: 'PUT the file bytes to this URL',
        },
        fileUrl: {
          type: 'string',
          description: 'Permanent URL to store in DB',
        },
        viewUrl: { 
          type: 'string', 
          description: 'Pre-signed GET URL for immediate preview. Expires in 1 hour.' 
        },
      },
    },
  })
  @Post('presign')
  @HttpCode(HttpStatus.OK)
  // adding throttle guard to avoid spamming/ 
  // a rule on S3 is defnied to automaticcally delete orphaned files after 2 days.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { 
    ttl: 60000, limit: 10  // limiting 10 requests per IP per 60 seconds
  }})
  async presign(
    @Body() dto: PresignRequestDto,
  ): Promise<PresignResponseDto> {
    return this.uploadService.presign(dto.filename, dto.contentType);
  }
}
