import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
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
    // Loading env variables
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
    });
    this.bucket = process.env.S3_BUCKET_NAME!;
  }

  // S3 database upload authorization url
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
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 minutes expiration
    const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { uploadUrl: uploadUrl, fileUrl: fileUrl };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // remove leading "/"
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  // Moves a file from the uploads/ staging area to the documents/ permanent area.
  // Files in uploads/ are deleted by the S3 lifecycle rule after 2 days, so only
  // committed (DB-linked) files should be moved here. If the URL is already in
  // documents/ (e.g. called twice), it is returned unchanged.
  async commitFile(fileUrl: string): Promise<string> {
    const url = new URL(fileUrl);
    const oldKey = url.pathname.slice(1);

    if (!oldKey.startsWith('uploads/')) {
      return fileUrl;
    }

    const filename = oldKey.slice('uploads/'.length);
    const newKey = `documents/${filename}`;

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
}
