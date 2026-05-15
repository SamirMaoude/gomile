import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { PresignResponseDto } from './dto/presign-response.dto';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.S3_BUCKET_NAME
    ) {
      throw new Error(
        'AWS environment variables not defined. You must create an account on AWS with an IAM user and a bucket. Contact Khoa !',
      );
    }
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    this.bucket = process.env.S3_BUCKET_NAME!;
  }

  async presign(
    filename: string,
    contentType: string,
  ): Promise<PresignResponseDto> {
    const ext = path.extname(filename);
    const key = `uploads/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const viewUrl = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 3600 });
    return { uploadUrl, fileUrl, viewUrl };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1);
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  // Moves a file from uploads/ staging to documents/ permanent area.
  // Already committed or external URL → returned unchanged.
  async commitFile(fileUrl: string): Promise<string> {
    const url = new URL(fileUrl);
    const oldKey = url.pathname.slice(1);

    if (!oldKey.startsWith('uploads/')) {
      return fileUrl;
    }

    const newKey = `documents/${oldKey.slice('uploads/'.length)}`;

    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${oldKey}`,
        Key: newKey,
      }),
    );

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: oldKey }),
    );

    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
  }

  async getSignedDownloadUrl(fileUrl: string, expiresIn = 3600): Promise<string> {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1);
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
