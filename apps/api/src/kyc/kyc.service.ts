import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KYC_MESSAGES } from './kyc.message';
import { createApiError } from '../common/api-error';
import { API_ERRORS } from '../common/errors';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  //
  async approveDriverKyc(driverId: string) {
    const { driver, submission } = await this.findPendingSubmission(driverId);
    await this.prisma.$transaction([
      this.prisma.kycSubmission.update({
        where: { id: submission.id },
        data: { status: KycStatus.ACCEPTED, rejectionReason: null },
      }),
      this.prisma.driver.update({
        where: { userId: driver.userId },
        data: { kycStatus: KycStatus.ACCEPTED },
      }),
      this.prisma.driverDocument.updateMany({
        where: { driverId: driver.userId },
        data: { verified: true, rejectionReason: null },
      }),
    ]);

    return { message: KYC_MESSAGES.KYC_APPROVED };
  }

  async rejectDriverKyc(driverId: string, rejectionReason: string) {
    const { driver, submission } = await this.findPendingSubmission(driverId);

    await this.prisma.$transaction([
      this.prisma.kycSubmission.update({
        where: { id: submission.id },
        data: {
          status: KycStatus.REJECTED,
          rejectionReason,
        },
      }),
      this.prisma.driver.update({
        where: { userId: driver.userId },
        data: { kycStatus: KycStatus.REJECTED },
      }),
    ]);
    return { message: KYC_MESSAGES.KYC_REJECTED };
  }

  // find submission
  private async findPendingSubmission(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
      include: {
        kycSubmissions: {
          where: { status: KycStatus.PENDING },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(
        createApiError('DRIVER_NOT_FOUND', API_ERRORS),
      );
    }

    const submission = driver.kycSubmissions[0];
    // if there is no submission
    if (!submission) {
      throw new NotFoundException(
        createApiError('KYC_SUBMISSION_NOT_FOUND', API_ERRORS),
      );
    }
    // front end shouldn't be able to call this if there is no kyc pending
    if (submission.status !== KycStatus.PENDING) {
      throw new ConflictException(
        createApiError('KYC_VERIFYING_IN_PROCESS', API_ERRORS),
      );
    }

    return { driver, submission };
  }

  async submitKyc(userId: string) {
    // Check if driver exists
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { driverDocuments: { take: 1 } },
    });

    if (!driver) {
      throw new NotFoundException(
        createApiError('DRIVER_NOT_FOUND', API_ERRORS),
      );
    }

    if (driver.kycStatus === KycStatus.PENDING) {
      throw new ConflictException(
        createApiError('KYC_VERIFYING_IN_PROCESS', API_ERRORS),
      );
    }

    // submit kyc should not be called when kyc status is already verified
    if (driver.kycStatus === KycStatus.ACCEPTED) {
      throw new ConflictException(
        createApiError('KYC_ALREADY_APPROVED', API_ERRORS),
      );
    }

    // Cannot call submit KYC if there is no documents
    if (driver.driverDocuments.length === 0) {
      throw new ConflictException(
        createApiError('KYC_NO_DOCUMENTS', API_ERRORS),
      );
    }

    // Update all
    await this.prisma.$transaction([
      this.prisma.kycSubmission.create({
        data: { driverId: userId, status: KycStatus.PENDING },
      }),
      this.prisma.driver.update({
        where: { userId },
        data: { kycStatus: KycStatus.PENDING },
      }),
    ]);

    return { message: KYC_MESSAGES.KYC_SUBMITTED };
  }

  async getMyKycStatus(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        kycSubmissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        driverDocuments: {
          select: {
            id: true,
            type: true,
            url: true,
            verified: true,
            rejectionReason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!driver) {
      throw new NotFoundException(
        createApiError('KYC_SUBMISSION_NOT_FOUND', API_ERRORS),
      );
    }

    const latestSubmission = driver.kycSubmissions[0] ?? null;

    return {
      status: driver.kycStatus,
      documents: driver.driverDocuments,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            status: latestSubmission.status,
            rejectionReason: latestSubmission.rejectionReason,
            createdAt: latestSubmission.createdAt,
          }
        : null,
    };
  }
}
