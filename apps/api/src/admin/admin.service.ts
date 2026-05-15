import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createApiError } from '../common/api-error';
import { API_ERRORS } from '../common/errors';
import { ADMIN_MESSAGES } from './admin.message';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}
  async getAllMerchants() {
    return this.prisma.merchant.findMany({
      select: {
        userId: true,
        name: true,
        createdAt: true,
        subscription: true,
        subscriptionStatus: true,
        user: { select: { email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMerchant(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: merchantId },
      select: {
        userId: true,
        name: true,
        createdAt: true,
        subscription: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        user: { select: { email: true, phone: true } },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            isActive: true,
            isLocked: true,
            createdAt: true,
          },
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            revokedAt: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException(createApiError('MERCHANT_NOT_FOUND', API_ERRORS));
    }

    return merchant;
  }
  // return all drivers
  async getAllDrivers() {
    return this.prisma.driver.findMany({
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        status: true,
        kycStatus: true,
        kycSubmissions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        totalTrips: true,
        gomileCode: true,
        user: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async getDriver(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        zipCode: true,
        street: true,
        deliveryCity: true,
        deliveryRadius: true,
        transportType: true,
        activeVehicle: true,
        status: true,
        kycStatus: true,
        rating: true,
        totalTrips: true,
        gomileCode: true,
        siret: true,
        createdAt: true,
        user: {
          select: { email: true, phone: true },
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
        kycSubmissions: {
          select: {
            id: true,
            status: true,
            rejectionReason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        wallet: {
          select: { balance: true },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(
        createApiError('DRIVER_NOT_FOUND', API_ERRORS),
      );
    }

    const signedDocuments = await Promise.all(
      driver.driverDocuments.map(async (doc) => ({
        ...doc,
        url: await this.uploadService.getSignedDownloadUrl(doc.url),
      })),
    );

    return { ...driver, driverDocuments: signedDocuments };
  }

  async getWithdrawals(
    userId?: string,
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  ) {
    return this.prisma.walletEntry.findMany({
      where: {
        type: 'DEBIT',
        ...(status && { status }),
        ...(userId && { userId: userId }),
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        wallet: {
          select: {
            driver: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWithdrawal(entryId: string, status: 'COMPLETED' | 'CANCELLED') {
    const entry = await this.prisma.walletEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException(
        createApiError('WITHDRAWAL_NOT_FOUND', API_ERRORS),
      );
    }

    if (entry.status !== 'PENDING') {
      throw new ConflictException(
        createApiError('WITHDRAWAL_NOT_PENDING', API_ERRORS),
      );
    }

    await this.prisma.$transaction([
      this.prisma.walletEntry.update({
        where: {
          id: entryId,
        },
        data: {
          status,
        },
      }),
      ...(status === 'CANCELLED'
        ? [
            this.prisma.wallet.update({
              where: { id: entry.walletId },
              data: { balance: { increment: entry.amount } },
            }),
          ]
        : []),
    ]);

    return {
      message:
        status === 'COMPLETED'
          ? ADMIN_MESSAGES.WITHDRAWAL_COMPLETED
          : ADMIN_MESSAGES.WITHDRAWAL_CANCELLED,
    };
  }

  async unlockHandshake(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id : orderId
      }
    });

    if (!order) {
      throw new NotFoundException(createApiError('ORDER_NOT_FOUND', API_ERRORS))
    }

    await this.prisma.handshake.updateMany({
      where: {
        orderId: orderId
      },
      data: {
        remainingAttemps: 3
      }
    })
    return { message: 'Order handshake has been reset successfully' }
  }
}
